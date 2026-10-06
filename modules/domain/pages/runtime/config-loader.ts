import type { DomainConfig, DomainPagesOptions } from './types'
import {
    loadDomainConfigs as loadDomainConfigsShared,
    type LoadDomainConfigsResult,
} from '../../shared/runtime/config-loader'

export type { LoadDomainConfigsResult }

/**
 * @param runtimeDir - Chemin absolu vers `modules/domain/shared/runtime`
 */
export async function loadDomainConfigs(
    domainsRoot: string,
    options: DomainPagesOptions,
    runtimeDir: string,
    debugLog?: (...args: unknown[]) => void
): Promise<Map<string, DomainConfig>> {
    const { configs } = await loadDomainConfigsShared<DomainConfig>({
        domainsRoot,
        options,
        runtimeDir,
        moduleLabel: 'domain-pages',
        debugLog,
        onConfigLoaded: ({ file, domainId, config }) => {
            debugLog?.('🧾 [domain-pages] domain.config chargé', {
                file,
                domainId,
                hasSubDomains: config?.hasSubDomains,
                subDomainsDirName: config?.subDomainsDirName,
            })
        },
    })
    return configs
}

export { normalizeDomainParts } from './utils'
