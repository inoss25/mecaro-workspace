import type { VehicleModel, VehicleModelCreateInput, VehicleModelUpdateInput } from '../types'

export interface VehicleModelFormState {
    vehicle_brand_id: string
    name: string
    key: string
    is_active: boolean
}

export function emptyVehicleModelForm(): VehicleModelFormState {
    return {
        vehicle_brand_id: '',
        name: '',
        key: '',
        is_active: true,
    }
}

export function formFromVehicleModel(model: VehicleModel): VehicleModelFormState {
    return {
        vehicle_brand_id: model.brand.id,
        name: model.name,
        key: model.key,
        is_active: model.is_active,
    }
}

export function slugifyVehicleModelKey(value: string) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

export function validateVehicleModelForm(form: VehicleModelFormState) {
    const errors: Record<string, string> = {}
    const name = form.name.trim()
    const key = form.key.trim()

    if (!form.vehicle_brand_id) errors.vehicle_brand_id = 'La marque est requise.'
    if (!name) errors.name = 'Le nom est requis.'
    if (!key) errors.key = 'La clé est requise.'
    else if (/\s/.test(key)) errors.key = 'La clé ne peut pas contenir d’espaces.'

    return errors
}

export function toVehicleModelCreateInput(form: VehicleModelFormState): VehicleModelCreateInput {
    return {
        vehicle_brand_id: form.vehicle_brand_id,
        name: form.name.trim(),
        key: form.key.trim(),
        is_active: form.is_active,
    }
}

export function toVehicleModelUpdateInput(form: VehicleModelFormState): VehicleModelUpdateInput {
    return {
        vehicle_brand_id: form.vehicle_brand_id,
        name: form.name.trim(),
        key: form.key.trim(),
        is_active: form.is_active,
    }
}
