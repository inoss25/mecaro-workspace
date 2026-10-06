import type { MaintenanceRecord, MaintenanceRecordCreateInput, MaintenanceRecordUpdateInput } from '../types'

export interface MaintenanceRecordFormState {
    vehicle_id: string
    maintenance_type_id: string
    maintenance_date: string
    mileage: string
    cost: string
    description: string
    notes: string
}

export function emptyMaintenanceRecordForm(vehicleId = ''): MaintenanceRecordFormState {
    return {
        vehicle_id: vehicleId,
        maintenance_type_id: '',
        maintenance_date: '',
        mileage: '',
        cost: '0',
        description: '',
        notes: '',
    }
}

export function formFromMaintenanceRecord(record: MaintenanceRecord): MaintenanceRecordFormState {
    return {
        vehicle_id: record.vehicle.id,
        maintenance_type_id: record.maintenance_type.id,
        maintenance_date: record.maintenance_date.slice(0, 10),
        mileage: String(record.mileage),
        cost: String(record.cost),
        description: record.description ?? '',
        notes: record.notes ?? '',
    }
}

function parseOptionalFloat(value: string) {
    const trimmed = value.trim().replace(',', '.')
    if (!trimmed) return null
    const parsed = Number.parseFloat(trimmed)
    return Number.isFinite(parsed) ? parsed : null
}

function parseRequiredInt(value: string) {
    const trimmed = value.trim()
    if (!trimmed) return null
    const parsed = Number.parseInt(trimmed, 10)
    return Number.isFinite(parsed) ? parsed : null
}

export function validateMaintenanceRecordForm(form: MaintenanceRecordFormState) {
    const errors: Record<string, string> = {}

    if (!form.vehicle_id) errors.vehicle_id = 'Le véhicule est requis.'
    if (!form.maintenance_type_id) errors.maintenance_type_id = 'Le type est requis.'
    if (!form.maintenance_date.trim()) errors.maintenance_date = 'La date est requise.'

    const mileage = parseRequiredInt(form.mileage)
    if (mileage == null) errors.mileage = 'Le kilométrage est requis.'
    else if (mileage < 0) errors.mileage = 'Le kilométrage doit être positif.'

    if (form.cost.trim()) {
        const cost = parseOptionalFloat(form.cost)
        if (cost == null) errors.cost = 'Montant invalide.'
        else if (cost < 0) errors.cost = 'Le montant doit être positif.'
    }

    return errors
}

export function toMaintenanceRecordCreateInput(form: MaintenanceRecordFormState): MaintenanceRecordCreateInput {
    return {
        vehicle_id: form.vehicle_id,
        maintenance_type_id: form.maintenance_type_id,
        maintenance_date: form.maintenance_date.trim(),
        mileage: parseRequiredInt(form.mileage)!,
        cost: parseOptionalFloat(form.cost) ?? 0,
        description: form.description.trim() || null,
        notes: form.notes.trim() || null,
    }
}

export function toMaintenanceRecordUpdateInput(form: MaintenanceRecordFormState): MaintenanceRecordUpdateInput {
    return {
        vehicle_id: form.vehicle_id,
        maintenance_type_id: form.maintenance_type_id,
        maintenance_date: form.maintenance_date.trim(),
        mileage: parseRequiredInt(form.mileage) ?? undefined,
        cost: parseOptionalFloat(form.cost) ?? 0,
        description: form.description.trim() || null,
        notes: form.notes.trim() || null,
    }
}
