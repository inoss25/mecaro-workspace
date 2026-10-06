import type { FuelType, Vehicle, VehicleOrderInput } from '../types'

export const FUEL_TYPE_OPTIONS: { value: FuelType, label: string }[] = [
    { value: 'PETROL', label: 'Essence' },
    { value: 'DIESEL', label: 'Diesel' },
    { value: 'ELECTRIC', label: 'Électrique' },
    { value: 'HYBRID', label: 'Hybride' },
]

export type VehicleOrderKey = 'created_desc' | 'created_asc' | 'updated_desc' | 'name_asc' | 'mileage_desc'

export const VEHICLE_ORDER_OPTIONS: { value: VehicleOrderKey, label: string, orderBy: VehicleOrderInput }[] = [
    { value: 'created_desc', label: 'Plus récents', orderBy: { column: 'CREATED_AT', order: 'DESC' } },
    { value: 'created_asc', label: 'Plus anciens', orderBy: { column: 'CREATED_AT', order: 'ASC' } },
    { value: 'updated_desc', label: 'Mis à jour', orderBy: { column: 'UPDATED_AT', order: 'DESC' } },
    { value: 'name_asc', label: 'Nom A → Z', orderBy: { column: 'NAME', order: 'ASC' } },
    { value: 'mileage_desc', label: 'Kilométrage', orderBy: { column: 'CURRENT_MILEAGE', order: 'DESC' } },
]

export function fuelTypeLabel(fuelType: FuelType | null | undefined) {
    return FUEL_TYPE_OPTIONS.find(option => option.value === fuelType)?.label ?? '—'
}

export function fuelTypeClass(fuelType: FuelType | null | undefined) {
    if (fuelType === 'ELECTRIC') return 'bg-primary/10 text-primary'
    if (fuelType === 'HYBRID') return 'bg-sky-50 text-sky-700'
    if (fuelType === 'DIESEL') return 'bg-neutral-100 text-neutral-700'
    if (fuelType === 'PETROL') return 'bg-amber-50 text-amber-800'
    return 'bg-neutral-100 text-neutral-500'
}

export function vehicleBrandName(vehicle: Pick<Vehicle, 'vehicleBrand' | 'custom_brand_name'>) {
    return vehicle.vehicleBrand?.name ?? vehicle.custom_brand_name?.trim() ?? ''
}

export function vehicleModelName(vehicle: Pick<Vehicle, 'vehicleModel' | 'custom_model_name'>) {
    return vehicle.vehicleModel?.name ?? vehicle.custom_model_name?.trim() ?? ''
}

export function vehicleIdentity(vehicle: Pick<Vehicle, 'vehicleBrand' | 'vehicleModel' | 'custom_brand_name' | 'custom_model_name'>) {
    return `${vehicleBrandName(vehicle)} ${vehicleModelName(vehicle)}`.trim()
}

export function vehicleLabel(vehicle: Pick<Vehicle, 'name' | 'vehicleBrand' | 'vehicleModel' | 'custom_brand_name' | 'custom_model_name'>) {
    const name = vehicle.name?.trim()
    if (name) return name
    return vehicleIdentity(vehicle) || 'Véhicule'
}

export function vehicleImageSrc(path: string | null | undefined, apiBaseUrl: string) {
    if (!path) return ''
    if (/^https?:\/\//i.test(path)) return path
    const base = apiBaseUrl.replace(/\/$/, '')
    const segment = path.startsWith('/') ? path : `/${path}`
    return `${base}${segment}`
}

export function orderByFromKey(key: VehicleOrderKey): VehicleOrderInput {
    return VEHICLE_ORDER_OPTIONS.find(option => option.value === key)?.orderBy
        ?? { column: 'CREATED_AT', order: 'DESC' }
}

export function isHexColor(value: string) {
    return /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim())
}
