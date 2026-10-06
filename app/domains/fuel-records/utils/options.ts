import type { FuelRecord, FuelRecordOrderInput, FuelRecordVehicleRef, FuelType } from '../types'

export const FUEL_TYPE_OPTIONS: { value: FuelType, label: string }[] = [
    { value: 'PETROL', label: 'Essence' },
    { value: 'DIESEL', label: 'Diesel' },
    { value: 'ELECTRIC', label: 'Électrique' },
    { value: 'HYBRID', label: 'Hybride' },
]

export type FuelRecordOrderKey = 'fuel_date_desc' | 'fuel_date_asc' | 'mileage_desc' | 'price_desc' | 'created_desc'

export const FUEL_RECORD_ORDER_OPTIONS: { value: FuelRecordOrderKey, label: string, orderBy: FuelRecordOrderInput }[] = [
    { value: 'fuel_date_desc', label: 'Date récente', orderBy: { column: 'FUEL_DATE', order: 'DESC' } },
    { value: 'fuel_date_asc', label: 'Date ancienne', orderBy: { column: 'FUEL_DATE', order: 'ASC' } },
    { value: 'mileage_desc', label: 'Kilométrage', orderBy: { column: 'MILEAGE', order: 'DESC' } },
    { value: 'price_desc', label: 'Montant', orderBy: { column: 'TOTAL_PRICE', order: 'DESC' } },
    { value: 'created_desc', label: 'Création', orderBy: { column: 'CREATED_AT', order: 'DESC' } },
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

export function orderByFromKey(key: FuelRecordOrderKey): FuelRecordOrderInput {
    return FUEL_RECORD_ORDER_OPTIONS.find(option => option.value === key)?.orderBy
        ?? { column: 'FUEL_DATE', order: 'DESC' }
}

export function formatMoney(value: number | null | undefined, currency = 'XOF') {
    if (value == null || Number.isNaN(value)) return '—'
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(value)
}

export function formatQuantity(value: number | null | undefined) {
    if (value == null || Number.isNaN(value)) return '—'
    return `${value.toLocaleString('fr-FR')} L`
}

export function fuelRecordVehicleLabel(vehicle: FuelRecordVehicleRef) {
    const name = vehicle.name?.trim()
    if (name) return name

    const brand = vehicle.vehicleBrand?.name ?? vehicle.custom_brand_name?.trim() ?? ''
    const model = vehicle.vehicleModel?.name ?? vehicle.custom_model_name?.trim() ?? ''
    const identity = `${brand} ${model}`.trim()
    if (identity) return identity

    return vehicle.registration_number?.trim() || 'Véhicule'
}

export function fuelRecordSummary(record: Pick<FuelRecord, 'fuel_date' | 'total_price' | 'mileage' | 'vehicle'>) {
    return `${fuelRecordVehicleLabel(record.vehicle)} — ${formatMoney(record.total_price)}`
}
