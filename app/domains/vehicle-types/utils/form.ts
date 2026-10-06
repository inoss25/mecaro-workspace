import type { VehicleType, VehicleTypeCreateInput, VehicleTypeUpdateInput } from '../types'

export interface VehicleTypeFormState {
    name: string
    key: string
    icon: string
    is_active: boolean
}

export function emptyVehicleTypeForm(): VehicleTypeFormState {
    return {
        name: '',
        key: '',
        icon: '',
        is_active: true,
    }
}

export function formFromVehicleType(vehicleType: VehicleType): VehicleTypeFormState {
    return {
        name: vehicleType.name,
        key: vehicleType.key,
        icon: vehicleType.icon ?? '',
        is_active: vehicleType.is_active,
    }
}

export function slugifyVehicleTypeKey(value: string) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

export function validateVehicleTypeForm(form: VehicleTypeFormState) {
    const errors: Record<string, string> = {}
    const name = form.name.trim()
    const key = form.key.trim()

    if (!name) errors.name = 'Le nom est requis.'
    if (!key) errors.key = 'La clé est requise.'
    else if (/\s/.test(key)) errors.key = 'La clé ne peut pas contenir d’espaces.'

    return errors
}

export function toVehicleTypeInput(form: VehicleTypeFormState): VehicleTypeCreateInput & VehicleTypeUpdateInput {
    return {
        name: form.name.trim(),
        key: form.key.trim(),
        icon: form.icon.trim() || null,
        is_active: form.is_active,
    }
}
