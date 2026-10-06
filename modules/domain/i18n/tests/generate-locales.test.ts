import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { generateLocales } from '../runtime/generate-locales'
import type { DomainI18nOptions } from '../runtime/types'

const here = dirname(fileURLToPath(import.meta.url))
const fixture = (name: string) => resolve(here, 'fixtures', name)
const runtimeDir = resolve(here, '../../shared/runtime')

const baseOptions: DomainI18nOptions = {
    domainsDir: 'app/domains',
    sharedI18nDirs: [],
    sharedMessagesNamespace: 'global',
    subDomainsDirName: 'domains',
    domainSegmentKeyFormat: 'snake_case',
}

describe('generateLocales', () => {
    let outputDir: string

    beforeEach(() => {
        outputDir = mkdtempSync(resolve(tmpdir(), 'domain-i18n-'))
    })

    afterEach(() => {
        rmSync(outputDir, { recursive: true, force: true })
    })

    it('agrège shared, domaines et sous-domaines', async () => {
        const rootDir = fixture('')
        await generateLocales({
            rootDir,
            domainsRoot: rootDir,
            outputDir,
            options: {
                ...baseOptions,
                sharedI18nDirs: [resolve(rootDir, 'shared-i18n')],
            },
            nuxt: {
                options: {
                    i18n: {
                        locales: [{ code: 'en', file: 'en.json' }],
                    },
                },
            },
            runtimeDir,
            debugLog: () => {},
        })

        const compiled = JSON.parse(
            readFileSync(resolve(outputDir, 'en.json'), 'utf8')
        )
        expect(compiled).toEqual({
            global: {
                appName: 'TestApp',
                common: { save: 'Save' },
            },
            home: {
                title: 'Home',
                emailPlaceholder: 'you\\@example.com',
            },
            shop: { checkout: { title: 'Checkout' } },
        })
    })

    it('écrit et met à jour typed-i18n.d.ts quand les clés changent', async () => {
        const rootDir = fixture('')
        const sharedDir = resolve(rootDir, 'shared-i18n')
        const params = {
            rootDir,
            domainsRoot: rootDir,
            outputDir,
            options: {
                ...baseOptions,
                sharedI18nDirs: [sharedDir],
            },
            nuxt: {
                options: {
                    i18n: {
                        locales: [{ code: 'en', file: 'en.json' }],
                    },
                },
            },
            runtimeDir,
            debugLog: () => {},
        }

        const first = await generateLocales(params)
        const typedPath = resolve(outputDir, 'typed-i18n.d.ts')
        const firstContent = readFileSync(typedPath, 'utf8')

        expect(first.typedChanged).toBe(true)
        expect(firstContent).toContain("'home.title'")
        expect(firstContent).toContain("'global.appName'")
        expect(firstContent).toContain("'shop.checkout.title'")

        const unchanged = await generateLocales(params)
        expect(unchanged.typedChanged).toBe(false)
        expect(readFileSync(typedPath, 'utf8')).toBe(firstContent)

        const extraDir = mkdtempSync(resolve(tmpdir(), 'domain-i18n-extra-'))
        writeFileSync(
            resolve(extraDir, 'en.json'),
            JSON.stringify({ extraKey: 'hello' }, null, 2)
        )

        try {
            const updated = await generateLocales({
                ...params,
                options: {
                    ...params.options,
                    sharedI18nDirs: [sharedDir, extraDir],
                },
            })
            const nextContent = readFileSync(typedPath, 'utf8')

            expect(updated.typedChanged).toBe(true)
            expect(nextContent).not.toBe(firstContent)
            expect(nextContent).toContain("'global.extraKey'")
        } finally {
            rmSync(extraDir, { recursive: true, force: true })
        }
    })
})
