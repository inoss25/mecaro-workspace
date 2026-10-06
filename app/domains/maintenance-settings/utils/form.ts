import type { MaintenanceSetting, MaintenanceSettingCreateInput, MaintenanceSettingUpdateInput } from '../types'

export interface MaintenanceSettingFormState {
    vehicle_id: string
    maintenance_type_id: string
    interval_km: string
    is_active: boolean
}

export function emptyMaintenanceSettingForm(vehicleId = ''): MaintenanceSettingFormState {
    return {
        vehicle_id: vehicleId,
        maintenance_type_id: '',
        interval_km: '',
        is_active: true,
    }
}

export function formFromMaintenanceSetting(setting: MaintenanceSetting): MaintenanceSettingFormState {
    return {
        vehicle_id: setting.vehicle.id,
        maintenance_type_id: setting.maintenance_type.id,
        interval_km: setting.interval_km != null ? String(setting.interval_km) : '',
        is_active: setting.is_active,
    }
}

function parseOptionalInt(value: string) {
    const trimmed = value.trim()
    if (!trimmed) return null
    const parsed = Number.parseInt(trimmed, 10)
    return Number.isFinite(parsed) ? parsed : null
}

export function validateMaintenanceSettingForm(form: MaintenanceSettingFormState) {
    const errors: Record<string, string> = {}
    if (!form.vehicle_id) errors.vehicle_id = 'Le véhicule est requis.'
    if (!form.maintenance_type_id) errors.maintenance_type_id = 'Le type est requis.'
    if (form.interval_km.trim()) {
        const interval = parseOptionalInt(form.interval_km)
        if (interval == null) errors.interval_km = 'Intervalle invalide.'
        else if (interval < 0) errors.interval_km = 'L’intervalle doit être positif.'
    }
    return errors
}

export function toMaintenanceSettingCreateInput(form: MaintenanceSettingFormState): MaintenanceSettingCreateInput {
    return {
        vehicle_id: form.vehicle_id,
        maintenance_type_id: form.maintenance_type_id,
        interval_km: form.interval_km.trim() ? Number.parseInt(form.interval_km, 10) : null,
        is_active: form.is_active,
    }
}

export function toMaintenanceSettingUpdateInput(form: MaintenanceSettingFormState): MaintenanceSettingUpdateInput {
    return toMaintenanceSettingCreateInput(form)
}
