import type { VehicleModelOrderInput } from '../types'

export type VehicleModelOrderKey = 'name_asc' | 'created_desc' | 'created_asc' | 'updated_desc'

export const VEHICLE_MODEL_ORDER_OPTIONS: { value: VehicleModelOrderKey, label: string, orderBy: VehicleModelOrderInput }[] = [
    { value: 'name_asc', label: 'Nom A → Z', orderBy: { column: 'NAME', order: 'ASC' } },
    { value: 'created_desc', label: 'Plus récents', orderBy: { column: 'CREATED_AT', order: 'DESC' } },
    { value: 'created_asc', label: 'Plus anciens', orderBy: { column: 'CREATED_AT', order: 'ASC' } },
    { value: 'updated_desc', label: 'Mis à jour', orderBy: { column: 'UPDATED_AT', order: 'DESC' } },
]

export function orderByFromKey(key: VehicleModelOrderKey): VehicleModelOrderInput {
    return VEHICLE_MODEL_ORDER_OPTIONS.find(option => option.value === key)?.orderBy
        ?? { column: 'CREATED_AT', order: 'DESC' }
}
