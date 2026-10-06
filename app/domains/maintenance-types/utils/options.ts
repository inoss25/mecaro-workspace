import type { MaintenanceTypeOrderInput } from '../types'

export type MaintenanceTypeOrderKey = 'name_asc' | 'created_desc' | 'updated_desc'

export const MAINTENANCE_TYPE_ORDER_OPTIONS: { value: MaintenanceTypeOrderKey, label: string, orderBy: MaintenanceTypeOrderInput }[] = [
    { value: 'name_asc', label: 'Nom A → Z', orderBy: { column: 'NAME', order: 'ASC' } },
    { value: 'created_desc', label: 'Plus récents', orderBy: { column: 'CREATED_AT', order: 'DESC' } },
    { value: 'updated_desc', label: 'Mis à jour', orderBy: { column: 'UPDATED_AT', order: 'DESC' } },
]

export function orderByFromKey(key: MaintenanceTypeOrderKey): MaintenanceTypeOrderInput {
    return MAINTENANCE_TYPE_ORDER_OPTIONS.find(option => option.value === key)?.orderBy
        ?? { column: 'NAME', order: 'ASC' }
}
