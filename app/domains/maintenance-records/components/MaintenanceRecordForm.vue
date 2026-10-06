<script setup lang="ts">
import type { MaintenanceType } from '../../maintenance-types/types'
import type { Vehicle } from '../../vehicles/types'
import type { MaintenanceRecordFormState } from '../utils/form'

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

const vehicleId = defineModel<MaintenanceRecordFormState['vehicle_id']>('vehicleId', { required: true })
const typeId = defineModel<MaintenanceRecordFormState['maintenance_type_id']>('typeId', { required: true })
const maintenanceDate = defineModel<MaintenanceRecordFormState['maintenance_date']>('maintenanceDate', { required: true })
const mileage = defineModel<MaintenanceRecordFormState['mileage']>('mileage', { required: true })
const cost = defineModel<MaintenanceRecordFormState['cost']>('cost', { required: true })
const description = defineModel<MaintenanceRecordFormState['description']>('description', { required: true })
const notes = defineModel<MaintenanceRecordFormState['notes']>('notes', { required: true })

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
    <div class="grid gap-5 sm:grid-cols-2">
        <div class="flex flex-col gap-2 sm:col-span-2">
            <label :for="vehicleSelectId" class="text-sm font-semibold text-neutral-900">
                Véhicule
            </label>
            <div class="relative">
                <select
                    :id="vehicleSelectId"
                    v-model="vehicleId"
                    name="vehicle_id"
                    class="h-11 w-full appearance-none rounded-2xl border border-neutral-200 bg-white px-4 pr-10 text-sm text-neutral-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="disabled || optionsLoading || lockVehicleId"
                    :aria-invalid="errors.vehicle_id ? 'true' : undefined"
                >
                    <option value="" disabled>
                        {{ optionsLoading ? 'Chargement…' : 'Choisir un véhicule' }}
                    </option>
                    <option
                        v-for="vehicle in vehicles"
                        :key="vehicle.id"
                        :value="vehicle.id"
                    >
                        {{ vehicleOptionLabel(vehicle) }}
                    </option>
                </select>
                <i class="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs text-neutral-400" aria-hidden="true" />
            </div>
            <p v-if="errors.vehicle_id" class="text-sm text-red-600" role="alert">
                {{ errors.vehicle_id }}
            </p>
        </div>

        <div class="flex flex-col gap-2 sm:col-span-2">
            <label :for="typeSelectId" class="text-sm font-semibold text-neutral-900">
                Type d’entretien
            </label>
            <div class="relative">
                <select
                    :id="typeSelectId"
                    v-model="typeId"
                    name="maintenance_type_id"
                    class="h-11 w-full appearance-none rounded-2xl border border-neutral-200 bg-white px-4 pr-10 text-sm text-neutral-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="disabled || optionsLoading"
                    :aria-invalid="errors.maintenance_type_id ? 'true' : undefined"
                >
                    <option value="" disabled>
                        {{ optionsLoading ? 'Chargement…' : 'Choisir un type' }}
                    </option>
                    <option
                        v-for="type in typeChoices"
                        :key="type.id"
                        :value="type.id"
                    >
                        {{ typeOptionLabel(type) }}
                    </option>
                </select>
                <i class="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs text-neutral-400" aria-hidden="true" />
            </div>
            <p v-if="errors.maintenance_type_id" class="text-sm text-red-600" role="alert">
                {{ errors.maintenance_type_id }}
            </p>
        </div>

        <UiInput
            v-model="maintenanceDate"
            name="maintenance_date"
            type="date"
            label="Date"
            icon="fa-regular fa-calendar"
            :error="errors.maintenance_date"
            :disabled="disabled"
            data-autofocus
        />

        <UiInput
            v-model="mileage"
            name="mileage"
            label="Kilométrage"
            placeholder="45000"
            icon="fa-solid fa-road"
            :error="errors.mileage"
            :disabled="disabled"
        />

        <UiInput
            v-model="cost"
            name="cost"
            label="Coût"
            placeholder="25000"
            icon="fa-solid fa-coins"
            :error="errors.cost"
            :disabled="disabled"
        />

        <UiInput
            v-model="description"
            name="description"
            label="Description"
            placeholder="Vidange et filtre"
            icon="fa-solid fa-align-left"
            :disabled="disabled"
        />

        <UiTextarea
            v-model="notes"
            name="notes"
            class="sm:col-span-2"
            label="Notes"
            placeholder="Observations de l’atelier"
            :disabled="disabled"
        />
    </div>
</template>
