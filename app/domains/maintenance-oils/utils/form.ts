import type { MaintenanceOil, MaintenanceOilCreateInput, MaintenanceOilUpdateInput } from '../types'

export interface MaintenanceOilFormState {
    maintenance_record_id: string
    brand: string
    product_name: string
    viscosity: string
    quantity: string
    unit: string
    unit_price: string
    total_price: string
    notes: string
}

export function emptyMaintenanceOilForm(recordId = ''): MaintenanceOilFormState {
    return {
        maintenance_record_id: recordId,
        brand: '',
        product_name: '',
        viscosity: '',
        quantity: '',
        unit: 'L',
        unit_price: '',
        total_price: '',
        notes: '',
    }
}

export function formFromMaintenanceOil(oil: MaintenanceOil): MaintenanceOilFormState {
    return {
        maintenance_record_id: oil.maintenance_record.id,
        brand: oil.brand ?? '',
        product_name: oil.product_name ?? '',
        viscosity: oil.viscosity ?? '',
        quantity: oil.quantity != null ? String(oil.quantity) : '',
        unit: oil.unit || 'L',
        unit_price: oil.unit_price != null ? String(oil.unit_price) : '',
        total_price: oil.total_price != null ? String(oil.total_price) : '',
        notes: oil.notes ?? '',
    }
}

function parseOptionalFloat(value: string) {
    const trimmed = value.trim().replace(',', '.')
    if (!trimmed) return null
    const parsed = Number.parseFloat(trimmed)
    return Number.isFinite(parsed) ? parsed : null
}

export function suggestOilTotal(form: MaintenanceOilFormState) {
    const quantity = parseOptionalFloat(form.quantity)
    const unitPrice = parseOptionalFloat(form.unit_price)
    if (quantity == null || unitPrice == null) return null
    return Math.round(quantity * unitPrice * 100) / 100
}

export function validateMaintenanceOilForm(form: MaintenanceOilFormState) {
    const errors: Record<string, string> = {}
    if (!form.maintenance_record_id) errors.maintenance_record_id = 'L’intervention est requise.'
    if (!form.unit.trim()) errors.unit = 'L’unité est requise.'
    if (form.quantity.trim() && parseOptionalFloat(form.quantity) == null) errors.quantity = 'Quantité invalide.'
    if (form.unit_price.trim() && parseOptionalFloat(form.unit_price) == null) errors.unit_price = 'Prix unitaire invalide.'
    if (form.total_price.trim() && parseOptionalFloat(form.total_price) == null) errors.total_price = 'Montant invalide.'
    return errors
}

export function toMaintenanceOilCreateInput(form: MaintenanceOilFormState): MaintenanceOilCreateInput {
    return {
        maintenance_record_id: form.maintenance_record_id,
        brand: form.brand.trim() || null,
        product_name: form.product_name.trim() || null,
        viscosity: form.viscosity.trim() || null,
        quantity: parseOptionalFloat(form.quantity),
        unit: form.unit.trim() || 'L',
        unit_price: parseOptionalFloat(form.unit_price),
        total_price: parseOptionalFloat(form.total_price),
        notes: form.notes.trim() || null,
    }
}

export function toMaintenanceOilUpdateInput(form: MaintenanceOilFormState): MaintenanceOilUpdateInput {
    return toMaintenanceOilCreateInput(form)
}
