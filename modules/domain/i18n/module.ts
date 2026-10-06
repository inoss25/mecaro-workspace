import { addTypeTemplate, defineNuxtModule, updateTemplates } from 'nuxt/kit'
import { resolve, relative, isAbsolute } from 'node:path'
import { fileIsUnderRoot, toPosixPath } from '../shared/runtime/paths'
import type { DomainI18nOptions } from './runtime/types'
import { generateLocales } from './runtime/generate-locales'
import { generateTypedI18nDts } from './runtime/typed-i18n'

function shouldRegenerateFromWatch(
    absPath: string,
    outputDir: string,
    domainsRoot: string,
    sharedRoots: string[]
): boolean {
    if (fileIsUnderRoot(absPath, outputDir)) return false

    if (fileIsUnderRoot(absPath, domainsRoot)) {
        const rel = toPosixPath(relative(domainsRoot, absPath))
        if (rel.endsWith('domain.config.ts')) return true
        if (rel.endsWith('.json') && /(^|\/)i18n\//.test(rel)) return true
    }

    for (const root of sharedRoots) {
        if (fileIsUnderRoot(absPath, root) && absPath.endsWith('.json'))
            return true
    }

    return false
}

export default defineNuxtModule<DomainI18nOptions>({
    meta: {
        name: 'domain-i18n',
        configKey: 'domainI18n',
    },

    defaults: {
        domainsDir: 'app/domains',
        sharedI18nDirs: ['app/shared/i18n'],
        sharedMessagesNamespace: 'global',
        outputDir: 'i18n/locales',
        subDomainsDirName: 'domains',
        domainSegmentKeyFormat: 'snake_case',
        strict: false,
        watchSourcesInDev: true,
        watchDebounceMs: 250,
        debug: false,
    },

    async setup(options, nuxt) {
        const rootDir = nuxt.options.rootDir
        const domainsRoot = resolve(rootDir, options.domainsDir!)
        const outputDir = resolve(rootDir, options.outputDir!)
        const debug = options.debug ?? false
        const debugLog = (...args: unknown[]) => {
            if (debug) console.log(...args)
        }
        const sharedRuntimeDir = resolve(__dirname, '../shared/runtime')

        if (!nuxt.options.i18n) {
            nuxt.options.i18n = {} as typeof nuxt.options.i18n
        }
        const i18nOpts = nuxt.options.i18n as Record<string, unknown>
        if (i18nOpts.langDir === undefined) {
            const i18nDirName =
                typeof i18nOpts.dir === 'string' ? i18nOpts.dir : 'i18n'
            const i18nBase = isAbsolute(i18nDirName)
                ? i18nDirName
                : resolve(rootDir, i18nDirName)
            const rel = relative(i18nBase, outputDir).replace(/\\/g, '/')
            i18nOpts.langDir = rel && !rel.startsWith('..') ? rel : 'locales'
        }

        let typedDtsContent = generateTypedI18nDts([])
        const typedTemplate = addTypeTemplate({
            filename: 'typed-i18n.d.ts',
            getContents: () => typedDtsContent,
        })

        const typedI18nFile = resolve(outputDir, 'typed-i18n.d.ts')
        nuxt.hook('prepare:types', ({ references }) => {
            references.push({ path: typedI18nFile })
        })

        const refreshTypedI18nTemplate = async (typedChanged: boolean) => {
            if (!typedChanged) return
            await updateTemplates({
                filter: (template) => template.filename === typedTemplate.filename,
            })
            debugLog('🔄 [domain-i18n] types typed-i18n.d.ts rafraîchis', {
                template: typedTemplate.filename,
            })
        }

        const runGenerate = async () => {
            const result = await generateLocales({
                rootDir,
                domainsRoot,
                outputDir,
                options,
                nuxt,
                runtimeDir: sharedRuntimeDir,
                debugLog,
            })
            typedDtsContent = result.typedContent
            return result
        }

        await runGenerate()

        nuxt.hook('build:before', async () => {
            const result = await runGenerate()
            await refreshTypedI18nTemplate(result.typedChanged)
        })

        const watchEnabled =
            nuxt.options.dev && options.watchSourcesInDev !== false
        if (watchEnabled) {
            const sharedRootsAbs = (options.sharedI18nDirs ?? []).map((d) =>
                resolve(rootDir, d)
            )
            const debounceMs = options.watchDebounceMs ?? 250
            let debounceTimer: ReturnType<typeof setTimeout> | null = null

            const scheduleGenerate = () => {
                if (debounceTimer) clearTimeout(debounceTimer)
                debounceTimer = setTimeout(() => {
                    debounceTimer = null
                    void runGenerate()
                        .then((result) => refreshTypedI18nTemplate(result.typedChanged))
                        .catch((err) => {
                            console.error(
                                '[domain-i18n] régénération (watch) échouée:',
                                err
                            )
                        })
                }, debounceMs)
            }

            nuxt.hook('builder:watch', (_event, rawPath) => {
                const absPath = isAbsolute(rawPath)
                    ? rawPath
                    : resolve(nuxt.options.srcDir, rawPath)
                if (
                    !shouldRegenerateFromWatch(
                        absPath,
                        outputDir,
                        domainsRoot,
                        sharedRootsAbs
                    )
                ) {
                    return
                }
                debugLog('👁️ [domain-i18n] watch → régénération', {
                    file: relative(rootDir, absPath),
                })
                scheduleGenerate()
            })
        }
    },
})
