import { formatDate } from '../../../../shared/utils/date'
import type { MaintenanceRecord, MaintenanceRecordOrderInput, MaintenanceVehicleRef } from '../types'

export type MaintenanceRecordOrderKey = 'date_desc' | 'date_asc' | 'mileage_desc' | 'cost_desc' | 'created_desc'

export const MAINTENANCE_RECORD_ORDER_OPTIONS: { value: MaintenanceRecordOrderKey, label: string, orderBy: MaintenanceRecordOrderInput }[] = [
    { value: 'date_desc', label: 'Date récente', orderBy: { column: 'MAINTENANCE_DATE', order: 'DESC' } },
    { value: 'date_asc', label: 'Date ancienne', orderBy: { column: 'MAINTENANCE_DATE', order: 'ASC' } },
    { value: 'mileage_desc', label: 'Kilométrage', orderBy: { column: 'MILEAGE', order: 'DESC' } },
    { value: 'cost_desc', label: 'Coût', orderBy: { column: 'COST', order: 'DESC' } },
    { value: 'created_desc', label: 'Création', orderBy: { column: 'CREATED_AT', order: 'DESC' } },
]

export function orderByFromKey(key: MaintenanceRecordOrderKey): MaintenanceRecordOrderInput {
    return MAINTENANCE_RECORD_ORDER_OPTIONS.find(option => option.value === key)?.orderBy
        ?? { column: 'MAINTENANCE_DATE', order: 'DESC' }
}

export function formatMoney(value: number | null | undefined, currency = 'XOF') {
    if (value == null || Number.isNaN(value)) return '—'
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(value)
}

export function maintenanceVehicleLabel(vehicle: MaintenanceVehicleRef) {
    const name = vehicle.name?.trim()
    if (name) return name

    const brand = vehicle.vehicleBrand?.name ?? vehicle.custom_brand_name?.trim() ?? ''
    const model = vehicle.vehicleModel?.name ?? vehicle.custom_model_name?.trim() ?? ''
    const identity = `${brand} ${model}`.trim()
    if (identity) return identity

    return vehicle.registration_number?.trim() || 'Véhicule'
}

export function maintenanceRecordLabel(record: Pick<MaintenanceRecord, 'maintenance_date' | 'vehicle' | 'maintenance_type'>) {
    const plate = record.vehicle.registration_number?.trim()
    const vehicle = plate
        ? `${maintenanceVehicleLabel(record.vehicle)} (${plate})`
        : maintenanceVehicleLabel(record.vehicle)
    return `${formatDate(record.maintenance_date)} — ${vehicle} — ${record.maintenance_type.name}`
}
