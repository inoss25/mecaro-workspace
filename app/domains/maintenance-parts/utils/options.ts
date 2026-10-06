import type { MaintenancePartOrderInput } from '../types'

export type MaintenancePartOrderKey = 'name_asc' | 'created_desc' | 'updated_desc'

export const MAINTENANCE_PART_ORDER_OPTIONS: { value: MaintenancePartOrderKey, label: string, orderBy: MaintenancePartOrderInput }[] = [
    { value: 'name_asc', label: 'Nom A → Z', orderBy: { column: 'NAME', order: 'ASC' } },
    { value: 'created_desc', label: 'Plus récentes', orderBy: { column: 'CREATED_AT', order: 'DESC' } },
    { value: 'updated_desc', label: 'Mis à jour', orderBy: { column: 'UPDATED_AT', order: 'DESC' } },
]

export function orderByFromKey(key: MaintenancePartOrderKey): MaintenancePartOrderInput {
    return MAINTENANCE_PART_ORDER_OPTIONS.find(option => option.value === key)?.orderBy
        ?? { column: 'NAME', order: 'ASC' }
}
