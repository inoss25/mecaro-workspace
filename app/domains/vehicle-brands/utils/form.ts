import type { VehicleBrand, VehicleBrandCreateInput, VehicleBrandUpdateInput } from '../types'

export interface VehicleBrandFormState {
    name: string
    key: string
    is_active: boolean
}

export function emptyVehicleBrandForm(): VehicleBrandFormState {
    return {
        name: '',
        key: '',
        is_active: true,
    }
}

export function formFromVehicleBrand(brand: VehicleBrand): VehicleBrandFormState {
    return {
        name: brand.name,
        key: brand.key,
        is_active: brand.is_active,
    }
}

export function slugifyVehicleBrandKey(value: string) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

export function validateVehicleBrandLogo(file: File) {
    if (!file.type.startsWith('image/')) return 'Choisissez un fichier image.'
    if (file.size > 2 * 1024 * 1024) return 'Le logo doit faire moins de 2 Mo.'
    return ''
}

export function validateVehicleBrandForm(form: VehicleBrandFormState) {
    const errors: Record<string, string> = {}
    const name = form.name.trim()
    const key = form.key.trim()

    if (!name) errors.name = 'Le nom est requis.'
    if (!key) errors.key = 'La clé est requise.'
    else if (/\s/.test(key)) errors.key = 'La clé ne peut pas contenir d’espaces.'

    return errors
}

export function toVehicleBrandCreateInput(form: VehicleBrandFormState): VehicleBrandCreateInput {
    return {
        name: form.name.trim(),
        key: form.key.trim(),
        is_active: form.is_active,
    }
}

export function toVehicleBrandUpdateInput(form: VehicleBrandFormState): VehicleBrandUpdateInput {
    return {
        name: form.name.trim(),
        key: form.key.trim(),
        is_active: form.is_active,
    }
}
