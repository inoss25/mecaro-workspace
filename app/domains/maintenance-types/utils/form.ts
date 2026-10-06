import type { MaintenanceType, MaintenanceTypeCreateInput, MaintenanceTypeUpdateInput } from '../types'

export interface MaintenanceTypeFormState {
    maintenance_category_id: string
    name: string
    description: string
    icon: string
    is_active: boolean
}

export function emptyMaintenanceTypeForm(categoryId = ''): MaintenanceTypeFormState {
    return {
        maintenance_category_id: categoryId,
        name: '',
        description: '',
        icon: '',
        is_active: true,
    }
}

export function formFromMaintenanceType(type: MaintenanceType): MaintenanceTypeFormState {
    return {
        maintenance_category_id: type.category.id,
        name: type.name,
        description: type.description ?? '',
        icon: type.icon ?? '',
        is_active: type.is_active,
    }
}

export function validateMaintenanceTypeForm(form: MaintenanceTypeFormState) {
    const errors: Record<string, string> = {}
    if (!form.maintenance_category_id) errors.maintenance_category_id = 'La catégorie est requise.'
    if (!form.name.trim()) errors.name = 'Le nom est requis.'
    return errors
}

export function toMaintenanceTypeCreateInput(form: MaintenanceTypeFormState): MaintenanceTypeCreateInput {
    return {
        maintenance_category_id: form.maintenance_category_id,
        name: form.name.trim(),
        description: form.description.trim() || null,
        icon: form.icon.trim() || null,
        is_active: form.is_active,
    }
}

export function toMaintenanceTypeUpdateInput(form: MaintenanceTypeFormState): MaintenanceTypeUpdateInput {
    return {
        maintenance_category_id: form.maintenance_category_id,
        name: form.name.trim(),
        description: form.description.trim() || null,
        icon: form.icon.trim() || null,
        is_active: form.is_active,
    }
}
