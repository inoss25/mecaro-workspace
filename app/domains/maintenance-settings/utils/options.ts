import type { MaintenanceSettingOrderInput } from '../types'

export type MaintenanceSettingOrderKey = 'interval_asc' | 'created_desc' | 'updated_desc'

export const MAINTENANCE_SETTING_ORDER_OPTIONS: { value: MaintenanceSettingOrderKey, label: string, orderBy: MaintenanceSettingOrderInput }[] = [
    { value: 'interval_asc', label: 'Intervalle', orderBy: { column: 'INTERVAL_KM', order: 'ASC' } },
    { value: 'created_desc', label: 'Plus récents', orderBy: { column: 'CREATED_AT', order: 'DESC' } },
    { value: 'updated_desc', label: 'Mis à jour', orderBy: { column: 'UPDATED_AT', order: 'DESC' } },
]

export function orderByFromKey(key: MaintenanceSettingOrderKey): MaintenanceSettingOrderInput {
    return MAINTENANCE_SETTING_ORDER_OPTIONS.find(option => option.value === key)?.orderBy
        ?? { column: 'CREATED_AT', order: 'DESC' }
}

export function formatInterval(value: number | null | undefined) {
    if (value == null || Number.isNaN(value)) return '—'
    return `${value.toLocaleString('fr-FR')} km`
}
