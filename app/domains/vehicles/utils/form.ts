import type { FuelType, Vehicle, VehicleCreateInput, VehicleUpdateInput } from '../types'

export type VehicleBrandSource = 'catalog' | 'custom'

export interface VehicleFormState {
    user_id: string
    vehicle_type_id: string
    brand_source: VehicleBrandSource
    vehicle_brand_id: string
    vehicle_model_id: string
    custom_brand_name: string
    custom_model_name: string
    name: string
    registration_number: string
    fuel_type: FuelType | ''
    color: string
    engine_capacity: string
    transmission: string
    purchase_date: string
    manufacture_year: string
    initial_mileage: string
    current_mileage: string
    is_active: boolean
}

export function emptyVehicleForm(): VehicleFormState {
    return {
        user_id: '',
        vehicle_type_id: '',
        brand_source: 'catalog',
        vehicle_brand_id: '',
        vehicle_model_id: '',
        custom_brand_name: '',
        custom_model_name: '',
        name: '',
        registration_number: '',
        fuel_type: '',
        color: '',
        engine_capacity: '',
        transmission: '',
        purchase_date: '',
        manufacture_year: '',
        initial_mileage: '',
        current_mileage: '',
        is_active: true,
    }
}

function parseOptionalInt(value: string) {
    const trimmed = value.trim()
    if (!trimmed) return null
    const parsed = Number.parseInt(trimmed, 10)
    return Number.isFinite(parsed) ? parsed : null
}

function manufactureYearToDate(value: string) {
    const year = value.trim()
    if (!/^\d{4}$/.test(year)) return null
    return `${year}-01-01`
}

function dateToManufactureYear(value: string | null | undefined) {
    if (!value) return ''
    const match = value.match(/^(\d{4})/)
    return match?.[1] ?? ''
}

export function formFromVehicle(vehicle: Vehicle): VehicleFormState {
    const usesCatalog = Boolean(vehicle.vehicleBrand?.id)

    return {
        user_id: vehicle.user.id,
        vehicle_type_id: vehicle.vehicleType.id,
        brand_source: usesCatalog ? 'catalog' : 'custom',
        vehicle_brand_id: vehicle.vehicleBrand?.id ?? '',
        vehicle_model_id: vehicle.vehicleModel?.id ?? '',
        custom_brand_name: vehicle.custom_brand_name ?? '',
        custom_model_name: vehicle.custom_model_name ?? '',
        name: vehicle.name ?? '',
        registration_number: vehicle.registration_number ?? '',
        fuel_type: vehicle.fuel_type ?? '',
        color: vehicle.color ?? '',
        engine_capacity: vehicle.engine_capacity != null ? String(vehicle.engine_capacity) : '',
        transmission: vehicle.transmission ?? '',
        purchase_date: vehicle.purchase_date ?? '',
        manufacture_year: dateToManufactureYear(vehicle.manufacture_year),
        initial_mileage: vehicle.initial_mileage != null ? String(vehicle.initial_mileage) : '',
        current_mileage: vehicle.current_mileage != null ? String(vehicle.current_mileage) : '',
        is_active: vehicle.is_active,
    }
}

export function validateVehicleImage(file: File) {
    if (!file.type.startsWith('image/')) return 'Choisissez un fichier image.'
    if (file.size > 2 * 1024 * 1024) return 'L’image doit faire moins de 2 Mo.'
    return ''
}

export function validateVehicleForm(form: VehicleFormState, mode: 'create' | 'edit', imageFile: File | null) {
    const errors: Record<string, string> = {}

    if (mode === 'create' && !form.user_id) errors.user_id = 'Le propriétaire est requis.'
    if (!form.vehicle_type_id) errors.vehicle_type_id = 'Le type de véhicule est requis.'

    if (form.brand_source === 'catalog') {
        if (!form.vehicle_brand_id) errors.vehicle_brand_id = 'La marque est requise.'
        if (!form.vehicle_model_id) errors.vehicle_model_id = 'Le modèle est requis.'
    }
    else {
        if (!form.custom_brand_name.trim()) errors.custom_brand_name = 'La marque est requise.'
        if (!form.custom_model_name.trim()) errors.custom_model_name = 'Le modèle est requis.'
    }

    if (form.manufacture_year.trim() && !/^\d{4}$/.test(form.manufacture_year.trim())) {
        errors.manufacture_year = 'Indiquez une année à 4 chiffres.'
    }

    for (const [field, value] of [
        ['engine_capacity', form.engine_capacity],
        ['initial_mileage', form.initial_mileage],
        ['current_mileage', form.current_mileage],
    ] as const) {
        if (value.trim() && parseOptionalInt(value) === null) {
            errors[field] = 'Indiquez un nombre entier.'
        }
    }

    if (imageFile) {
        const imageMessage = validateVehicleImage(imageFile)
        if (imageMessage) errors.image = imageMessage
    }

    return errors
}

function sharedVehicleFields(form: VehicleFormState) {
    return {
        name: form.name.trim() || null,
        registration_number: form.registration_number.trim() || null,
        fuel_type: form.fuel_type || null,
        color: form.color.trim() || null,
        engine_capacity: parseOptionalInt(form.engine_capacity),
        transmission: form.transmission.trim() || null,
        purchase_date: form.purchase_date.trim() || null,
        manufacture_year: manufactureYearToDate(form.manufacture_year),
        initial_mileage: parseOptionalInt(form.initial_mileage),
        current_mileage: parseOptionalInt(form.current_mileage),
        is_active: form.is_active,
    }
}

function brandModelFields(form: VehicleFormState) {
    if (form.brand_source === 'catalog') {
        return {
            vehicle_brand_id: form.vehicle_brand_id,
            vehicle_model_id: form.vehicle_model_id,
            custom_brand_name: null,
            custom_model_name: null,
        }
    }

    return {
        vehicle_brand_id: null,
        vehicle_model_id: null,
        custom_brand_name: form.custom_brand_name.trim(),
        custom_model_name: form.custom_model_name.trim(),
    }
}

export function toVehicleCreateInput(form: VehicleFormState, image?: File | null): VehicleCreateInput {
    return {
        user_id: form.user_id,
        vehicle_type_id: form.vehicle_type_id,
        ...brandModelFields(form),
        ...sharedVehicleFields(form),
        ...(image ? { image } : {}),
    }
}

export function toVehicleUpdateInput(form: VehicleFormState): VehicleUpdateInput {
    return {
        vehicle_type_id: form.vehicle_type_id,
        ...brandModelFields(form),
        ...sharedVehicleFields(form),
    }
}
