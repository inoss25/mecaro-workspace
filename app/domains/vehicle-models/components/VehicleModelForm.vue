<script setup lang="ts">
import type { VehicleBrand } from '../../vehicle-brands/types'
import { slugifyVehicleModelKey, type VehicleModelFormState } from '../utils/form'

const props = withDefaults(defineProps<{
    errors?: Record<string, string>
    disabled?: boolean
    brands?: VehicleBrand[]
    optionsLoading?: boolean
    autoKey?: boolean
}>(), {
    errors: () => ({}),
    disabled: false,
    brands: () => [],
    optionsLoading: false,
    autoKey: false,
})

const vehicleBrandId = defineModel<VehicleModelFormState['vehicle_brand_id']>('vehicleBrandId', { required: true })
const name = defineModel<VehicleModelFormState['name']>('name', { required: true })
const modelKey = defineModel<VehicleModelFormState['key']>('modelKey', { required: true })
const isActive = defineModel<VehicleModelFormState['is_active']>('isActive', { required: true })

const brandSelectId = useId()
const keyTouched = ref(false)

const brandChoices = computed(() => {
    const active = props.brands.filter(brand => brand.is_active)
    const current = props.brands.find(brand => brand.id === vehicleBrandId.value)
    if (current && !current.is_active) return [current, ...active]
    return active
})

watch(name, (value) => {
    if (!props.autoKey || keyTouched.value) return
    modelKey.value = slugifyVehicleModelKey(value)
})

watch(modelKey, (value) => {
    if (!props.autoKey || keyTouched.value) return
    if (value !== slugifyVehicleModelKey(name.value)) keyTouched.value = true
})
</script>

<template>
    <div class="flex flex-col gap-5">
        <div class="flex flex-col gap-2">
            <label :for="brandSelectId" class="text-sm font-semibold text-neutral-900">
                Marque
            </label>
            <div class="relative">
                <select
                    :id="brandSelectId"
                    v-model="vehicleBrandId"
                    name="vehicle_brand_id"
                    class="h-11 w-full appearance-none rounded-2xl border border-neutral-200 bg-white px-4 pr-10 text-sm text-neutral-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="disabled || optionsLoading"
                    :aria-invalid="errors.vehicle_brand_id ? 'true' : undefined"
                >
                    <option value="" disabled>
                        {{ optionsLoading ? 'Chargement…' : 'Choisir une marque' }}
                    </option>
                    <option
                        v-for="brand in brandChoices"
                        :key="brand.id"
                        :value="brand.id"
                    >
                        {{ brand.name }}
                    </option>
                </select>
                <i class="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs text-neutral-400" aria-hidden="true" />
            </div>
            <p v-if="errors.vehicle_brand_id" class="text-sm text-red-600" role="alert">
                {{ errors.vehicle_brand_id }}
            </p>
        </div>

        <UiInput
            v-model="name"
            name="name"
            label="Nom du modèle"
            placeholder="Corolla"
            icon="fa-solid fa-car"
            :error="errors.name"
            :disabled="disabled"
            data-autofocus
        />

        <UiInput
            v-model="modelKey"
            name="key"
            label="Clé"
            placeholder="corolla"
            icon="fa-solid fa-key"
            hint="Identifiant technique, par exemple corolla."
            :error="errors.key"
            :disabled="disabled"
        />

        <UiSwitch
            v-model="isActive"
            name="is_active"
            label="Actif"
            description="Ce modèle peut être associé à un véhicule."
            :disabled="disabled"
        />
    </div>
</template>
