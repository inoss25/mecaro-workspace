<script setup lang="ts">
import type { MaintenanceType } from '../../maintenance-types/types'
import type { Vehicle } from '../../vehicles/types'
import type { MaintenanceSettingFormState } from '../utils/form'

const props = withDefaults(defineProps<{
    errors?: Record<string, string>
    disabled?: boolean
    vehicles?: Vehicle[]
    types?: MaintenanceType[]
    optionsLoading?: boolean
    lockVehicleId?: boolean
    vehicleOptionLabel?: (vehicle: Vehicle) => string
    typeOptionLabel?: (type: MaintenanceType) => string
}>(), {
    errors: () => ({}),
    disabled: false,
    vehicles: () => [],
    types: () => [],
    optionsLoading: false,
    lockVehicleId: false,
    vehicleOptionLabel: (vehicle: Vehicle) => vehicle.name ?? vehicle.registration_number ?? vehicle.id,
    typeOptionLabel: (type: MaintenanceType) => type.name,
})

const vehicleId = defineModel<MaintenanceSettingFormState['vehicle_id']>('vehicleId', { required: true })
const typeId = defineModel<MaintenanceSettingFormState['maintenance_type_id']>('typeId', { required: true })
const intervalKm = defineModel<MaintenanceSettingFormState['interval_km']>('intervalKm', { required: true })
const isActive = defineModel<MaintenanceSettingFormState['is_active']>('isActive', { required: true })

const vehicleSelectId = useId()
const typeSelectId = useId()

const typeChoices = computed(() => {
    const active = props.types.filter(type => type.is_active)
    const current = props.types.find(type => type.id === typeId.value)
    if (current && !current.is_active) return [current, ...active]
    return active
})
</script>

<template>
    <div class="flex flex-col gap-5">
        <div class="flex flex-col gap-2">
            <label :for="vehicleSelectId" class="text-sm font-semibold text-neutral-900">Véhicule</label>
            <div class="relative">
                <select :id="vehicleSelectId" v-model="vehicleId" name="vehicle_id" class="h-11 w-full appearance-none rounded-2xl border border-neutral-200 bg-white px-4 pr-10 text-sm text-neutral-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60" :disabled="disabled || optionsLoading || lockVehicleId" :aria-invalid="errors.vehicle_id ? 'true' : undefined">
                    <option value="" disabled>{{ optionsLoading ? 'Chargement…' : 'Choisir un véhicule' }}</option>
                    <option v-for="vehicle in vehicles" :key="vehicle.id" :value="vehicle.id">{{ vehicleOptionLabel(vehicle) }}</option>
                </select>
                <i class="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs text-neutral-400" aria-hidden="true" />
            </div>
            <p v-if="errors.vehicle_id" class="text-sm text-red-600" role="alert">{{ errors.vehicle_id }}</p>
        </div>

        <div class="flex flex-col gap-2">
            <label :for="typeSelectId" class="text-sm font-semibold text-neutral-900">Type d’entretien</label>
            <div class="relative">
                <select :id="typeSelectId" v-model="typeId" name="maintenance_type_id" class="h-11 w-full appearance-none rounded-2xl border border-neutral-200 bg-white px-4 pr-10 text-sm text-neutral-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60" :disabled="disabled || optionsLoading" :aria-invalid="errors.maintenance_type_id ? 'true' : undefined">
                    <option value="" disabled>{{ optionsLoading ? 'Chargement…' : 'Choisir un type' }}</option>
                    <option v-for="type in typeChoices" :key="type.id" :value="type.id">{{ typeOptionLabel(type) }}</option>
                </select>
                <i class="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs text-neutral-400" aria-hidden="true" />
            </div>
            <p v-if="errors.maintenance_type_id" class="text-sm text-red-600" role="alert">{{ errors.maintenance_type_id }}</p>
        </div>

        <UiInput v-model="intervalKm" name="interval_km" label="Intervalle (km)" placeholder="10000" icon="fa-solid fa-gauge-high" hint="Kilométrage entre deux entretiens de ce type." :error="errors.interval_km" :disabled="disabled" data-autofocus />
        <UiSwitch v-model="isActive" name="is_active" label="Actif" description="Cet intervalle est pris en compte pour le véhicule." :disabled="disabled" />
    </div>
</template>
