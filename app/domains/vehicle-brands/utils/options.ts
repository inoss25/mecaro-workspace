import type { VehicleBrandOrderInput } from '../types'

export type VehicleBrandOrderKey = 'name_asc' | 'created_desc' | 'created_asc' | 'updated_desc'

export const VEHICLE_BRAND_ORDER_OPTIONS: { value: VehicleBrandOrderKey, label: string, orderBy: VehicleBrandOrderInput }[] = [
    { value: 'name_asc', label: 'Nom A → Z', orderBy: { column: 'NAME', order: 'ASC' } },
    { value: 'created_desc', label: 'Plus récentes', orderBy: { column: 'CREATED_AT', order: 'DESC' } },
    { value: 'created_asc', label: 'Plus anciennes', orderBy: { column: 'CREATED_AT', order: 'ASC' } },
    { value: 'updated_desc', label: 'Mis à jour', orderBy: { column: 'UPDATED_AT', order: 'DESC' } },
]

export function orderByFromKey(key: VehicleBrandOrderKey): VehicleBrandOrderInput {
    return VEHICLE_BRAND_ORDER_OPTIONS.find(option => option.value === key)?.orderBy
        ?? { column: 'CREATED_AT', order: 'DESC' }
}

export function vehicleBrandLogoSrc(path: string | null | undefined, apiBaseUrl: string) {
    if (!path) return ''
    if (/^https?:\/\//i.test(path)) return path
    const base = apiBaseUrl.replace(/\/$/, '')
    const segment = path.startsWith('/') ? path : `/${path}`
    return `${base}${segment}`
}

export function vehicleBrandLogoUrl(
    brand: { logo_url?: string | null, logo_path?: string | null },
    apiBaseUrl: string,
) {
    if (brand.logo_url) return brand.logo_url
    return vehicleBrandLogoSrc(brand.logo_path, apiBaseUrl)
}
