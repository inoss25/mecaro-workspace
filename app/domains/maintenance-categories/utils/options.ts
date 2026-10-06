import type { MaintenanceCategoryOrderInput } from '../types'

export type MaintenanceCategoryOrderKey = 'name_asc' | 'created_desc' | 'updated_desc'

export const MAINTENANCE_CATEGORY_ORDER_OPTIONS: { value: MaintenanceCategoryOrderKey, label: string, orderBy: MaintenanceCategoryOrderInput }[] = [
    { value: 'name_asc', label: 'Nom A → Z', orderBy: { column: 'NAME', order: 'ASC' } },
    { value: 'created_desc', label: 'Plus récentes', orderBy: { column: 'CREATED_AT', order: 'DESC' } },
    { value: 'updated_desc', label: 'Mis à jour', orderBy: { column: 'UPDATED_AT', order: 'DESC' } },
]

export function orderByFromKey(key: MaintenanceCategoryOrderKey): MaintenanceCategoryOrderInput {
    return MAINTENANCE_CATEGORY_ORDER_OPTIONS.find(option => option.value === key)?.orderBy
        ?? { column: 'NAME', order: 'ASC' }
}
