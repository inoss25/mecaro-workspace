import type { MaintenancePart, MaintenancePartCreateInput, MaintenancePartUpdateInput } from '../types'

export interface MaintenancePartFormState {
    maintenance_record_id: string
    name: string
    reference: string
    quantity: string
    unit_price: string
    total_price: string
    brand: string
    notes: string
}

export function emptyMaintenancePartForm(recordId = ''): MaintenancePartFormState {
    return {
        maintenance_record_id: recordId,
        name: '',
        reference: '',
        quantity: '1',
        unit_price: '',
        total_price: '',
        brand: '',
        notes: '',
    }
}

export function formFromMaintenancePart(part: MaintenancePart): MaintenancePartFormState {
    return {
        maintenance_record_id: part.maintenanceRecord.id,
        name: part.name,
        reference: part.reference ?? '',
        quantity: String(part.quantity),
        unit_price: part.unit_price != null ? String(part.unit_price) : '',
        total_price: part.total_price != null ? String(part.total_price) : '',
        brand: part.brand ?? '',
        notes: part.notes ?? '',
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

export function suggestPartTotal(form: MaintenancePartFormState) {
    const quantity = parseRequiredInt(form.quantity)
    const unitPrice = parseOptionalFloat(form.unit_price)
    if (quantity == null || unitPrice == null) return null
    return Math.round(quantity * unitPrice * 100) / 100
}

export function validateMaintenancePartForm(form: MaintenancePartFormState) {
    const errors: Record<string, string> = {}
    if (!form.maintenance_record_id) errors.maintenance_record_id = 'L’intervention est requise.'
    if (!form.name.trim()) errors.name = 'Le nom est requis.'
    const quantity = parseRequiredInt(form.quantity)
    if (quantity == null) errors.quantity = 'La quantité est requise.'
    else if (quantity < 1) errors.quantity = 'La quantité doit être au moins 1.'
    if (form.unit_price.trim() && parseOptionalFloat(form.unit_price) == null) errors.unit_price = 'Prix unitaire invalide.'
    if (form.total_price.trim() && parseOptionalFloat(form.total_price) == null) errors.total_price = 'Montant invalide.'
    return errors
}

export function toMaintenancePartCreateInput(form: MaintenancePartFormState): MaintenancePartCreateInput {
    return {
        maintenance_record_id: form.maintenance_record_id,
        name: form.name.trim(),
        reference: form.reference.trim() || null,
        quantity: parseRequiredInt(form.quantity) ?? 1,
        unit_price: parseOptionalFloat(form.unit_price),
        total_price: parseOptionalFloat(form.total_price),
        brand: form.brand.trim() || null,
        notes: form.notes.trim() || null,
    }
}

export function toMaintenancePartUpdateInput(form: MaintenancePartFormState): MaintenancePartUpdateInput {
    return toMaintenancePartCreateInput(form)
}
