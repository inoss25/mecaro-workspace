import type { MaintenanceOilOrderInput } from '../types'

export type MaintenanceOilOrderKey = 'created_desc' | 'updated_desc'

export const OIL_UNIT_OPTIONS = [
    { value: 'L', label: 'Litre' },
    { value: 'mL', label: 'Millilitre' },
]

export const MAINTENANCE_OIL_ORDER_OPTIONS: { value: MaintenanceOilOrderKey, label: string, orderBy: MaintenanceOilOrderInput }[] = [
    { value: 'created_desc', label: 'Plus récentes', orderBy: { column: 'CREATED_AT', order: 'DESC' } },
    { value: 'updated_desc', label: 'Mis à jour', orderBy: { column: 'UPDATED_AT', order: 'DESC' } },
]

export function orderByFromKey(key: MaintenanceOilOrderKey): MaintenanceOilOrderInput {
    return MAINTENANCE_OIL_ORDER_OPTIONS.find(option => option.value === key)?.orderBy
        ?? { column: 'CREATED_AT', order: 'DESC' }
}

export function formatOilQuantity(quantity: number | null | undefined, unit: string | null | undefined) {
    if (quantity == null || Number.isNaN(quantity)) return '—'
    return `${quantity.toLocaleString('fr-FR')} ${unit || ''}`.trim()
}
