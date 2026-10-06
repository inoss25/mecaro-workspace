import type { MaintenanceCategory, MaintenanceCategoryCreateInput, MaintenanceCategoryUpdateInput } from '../types'

export interface MaintenanceCategoryFormState {
    name: string
    icon: string
    description: string
    is_active: boolean
}

export function emptyMaintenanceCategoryForm(): MaintenanceCategoryFormState {
    return {
        name: '',
        icon: '',
        description: '',
        is_active: true,
    }
}

export function formFromMaintenanceCategory(category: MaintenanceCategory): MaintenanceCategoryFormState {
    return {
        name: category.name,
        icon: category.icon ?? '',
        description: category.description ?? '',
        is_active: category.is_active,
    }
}

export function validateMaintenanceCategoryForm(form: MaintenanceCategoryFormState) {
    const errors: Record<string, string> = {}
    if (!form.name.trim()) errors.name = 'Le nom est requis.'
    return errors
}

export function toMaintenanceCategoryCreateInput(form: MaintenanceCategoryFormState): MaintenanceCategoryCreateInput {
    return {
        name: form.name.trim(),
        icon: form.icon.trim() || null,
        description: form.description.trim() || null,
        is_active: form.is_active,
    }
}

export function toMaintenanceCategoryUpdateInput(form: MaintenanceCategoryFormState): MaintenanceCategoryUpdateInput {
    return {
        name: form.name.trim(),
        icon: form.icon.trim() || null,
        description: form.description.trim() || null,
        is_active: form.is_active,
    }
}
