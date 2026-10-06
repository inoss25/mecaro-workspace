import type { FuelRecord, FuelRecordCreateInput, FuelRecordUpdateInput, FuelType } from '../types'

export interface FuelRecordFormState {
    vehicle_id: string
    fuel_type: FuelType | ''
    mileage: string
    quantity: string
    unit_price: string
    total_price: string
    fuel_date: string
    payment_method: string
    full_tank: boolean
    notes: string
}

export function emptyFuelRecordForm(vehicleId = ''): FuelRecordFormState {
    return {
        vehicle_id: vehicleId,
        fuel_type: '',
        mileage: '',
        quantity: '',
        unit_price: '',
        total_price: '',
        fuel_date: '',
        payment_method: '',
        full_tank: true,
        notes: '',
    }
}

export function formFromFuelRecord(record: FuelRecord): FuelRecordFormState {
    return {
        vehicle_id: record.vehicle.id,
        fuel_type: record.fuel_type,
        mileage: String(record.mileage),
        quantity: record.quantity != null ? String(record.quantity) : '',
        unit_price: record.unit_price != null ? String(record.unit_price) : '',
        total_price: String(record.total_price),
        fuel_date: record.fuel_date,
        payment_method: record.payment_method ?? '',
        full_tank: record.full_tank,
        notes: record.notes ?? '',
    }
}

function parseOptionalFloat(value: string) {
    const trimmed = value.trim().replace(',', '.')
    if (!trimmed) return null
    const parsed = Number.parseFloat(trimmed)
    return Number.isFinite(parsed) ? parsed : null
}

function parseRequiredFloat(value: string) {
    const parsed = parseOptionalFloat(value)
    return parsed
}

function parseRequiredInt(value: string) {
    const trimmed = value.trim()
    if (!trimmed) return null
    const parsed = Number.parseInt(trimmed, 10)
    return Number.isFinite(parsed) ? parsed : null
}

export function suggestTotalPrice(form: FuelRecordFormState) {
    const quantity = parseOptionalFloat(form.quantity)
    const unitPrice = parseOptionalFloat(form.unit_price)
    if (quantity == null || unitPrice == null) return null
    return Math.round(quantity * unitPrice * 100) / 100
}

export function validateFuelRecordForm(form: FuelRecordFormState) {
    const errors: Record<string, string> = {}

    if (!form.vehicle_id) errors.vehicle_id = 'Le véhicule est requis.'
    if (!form.fuel_type) errors.fuel_type = 'Le carburant est requis.'
    if (!form.fuel_date.trim()) errors.fuel_date = 'La date est requise.'

    const mileage = parseRequiredInt(form.mileage)
    if (mileage == null) errors.mileage = 'Le kilométrage est requis.'
    else if (mileage < 0) errors.mileage = 'Le kilométrage doit être positif.'

    const total = parseRequiredFloat(form.total_price)
    if (total == null) errors.total_price = 'Le montant total est requis.'
    else if (total < 0) errors.total_price = 'Le montant doit être positif.'

    if (form.quantity.trim() && parseOptionalFloat(form.quantity) == null) {
        errors.quantity = 'Quantité invalide.'
    }
    if (form.unit_price.trim() && parseOptionalFloat(form.unit_price) == null) {
        errors.unit_price = 'Prix unitaire invalide.'
    }

    return errors
}

export function toFuelRecordCreateInput(form: FuelRecordFormState): FuelRecordCreateInput {
    const total = parseRequiredFloat(form.total_price)
    const mileage = parseRequiredInt(form.mileage)

    return {
        vehicle_id: form.vehicle_id,
        fuel_type: form.fuel_type as FuelType,
        mileage: mileage!,
        quantity: parseOptionalFloat(form.quantity),
        unit_price: parseOptionalFloat(form.unit_price),
        total_price: total!,
        fuel_date: form.fuel_date.trim(),
        payment_method: form.payment_method.trim() || null,
        full_tank: form.full_tank,
        notes: form.notes.trim() || null,
    }
}

export function toFuelRecordUpdateInput(form: FuelRecordFormState): FuelRecordUpdateInput {
    const total = parseRequiredFloat(form.total_price)
    const mileage = parseRequiredInt(form.mileage)

    return {
        vehicle_id: form.vehicle_id,
        fuel_type: form.fuel_type as FuelType,
        mileage: mileage ?? undefined,
        quantity: parseOptionalFloat(form.quantity),
        unit_price: parseOptionalFloat(form.unit_price),
        total_price: total ?? undefined,
        fuel_date: form.fuel_date.trim(),
        payment_method: form.payment_method.trim() || null,
        full_tank: form.full_tank,
        notes: form.notes.trim() || null,
    }
}
