<script setup lang="ts">
import type { User } from '../../users/types'
import type { VehicleBrand } from '../../vehicle-brands/types'
import type { VehicleModel } from '../../vehicle-models/types'
import type { VehicleType } from '../../vehicle-types/types'
import type { VehicleFormState } from '../utils/form'
import { fuelTypeClass, fuelTypeLabel, isHexColor } from '../utils/options'

const props = defineProps<{
    form: VehicleFormState
    imageFile: File | null
    users: User[]
    vehicleTypes: VehicleType[]
    vehicleBrands: VehicleBrand[]
    vehicleModels: VehicleModel[]
}>()

const previewUrl = ref('')

watch(() => props.imageFile, (file) => {
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = file && import.meta.client ? URL.createObjectURL(file) : ''
}, { immediate: true })

onBeforeUnmount(() => {
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})

const ownerName = computed(() => props.users.find(user => user.id === props.form.user_id)?.name ?? '')

const typeMeta = computed(() => props.vehicleTypes.find(type => type.id === props.form.vehicle_type_id))

const brandName = computed(() => {
    if (props.form.brand_source === 'catalog') {
        return props.vehicleBrands.find(brand => brand.id === props.form.vehicle_brand_id)?.name ?? ''
    }
    return props.form.custom_brand_name.trim()
})

const modelName = computed(() => {
    if (props.form.brand_source === 'catalog') {
        return props.vehicleModels.find(model => model.id === props.form.vehicle_model_id)?.name ?? ''
    }
    return props.form.custom_model_name.trim()
})

const identity = computed(() => `${brandName.value} ${modelName.value}`.trim())

const title = computed(() => props.form.name.trim() || identity.value || 'Nouveau véhicule')

const subtitle = computed(() => {
    if (props.form.name.trim() && identity.value) return identity.value
    return props.form.registration_number.trim()
})

const mileageLabel = computed(() => {
    const current = props.form.current_mileage.trim()
    const initial = props.form.initial_mileage.trim()
    if (current) return `${current} km`
    if (initial) return `${initial} km (initial)`
    return ''
})

const detailRows = computed(() => {
    const rows: { icon: string, label: string, value: string }[] = []

    if (ownerName.value) rows.push({ icon: 'fa-solid fa-user', label: 'Propriétaire', value: ownerName.value })
    if (typeMeta.value?.name) rows.push({ icon: 'fa-solid fa-tags', label: 'Type', value: typeMeta.value.name })
    if (props.form.registration_number.trim()) {
        rows.push({ icon: 'fa-regular fa-id-card', label: 'Immatriculation', value: props.form.registration_number.trim() })
    }
    if (props.form.fuel_type) {
        rows.push({ icon: 'fa-solid fa-gas-pump', label: 'Carburant', value: fuelTypeLabel(props.form.fuel_type) })
    }
    if (props.form.color.trim()) rows.push({ icon: 'fa-solid fa-palette', label: 'Couleur', value: props.form.color.trim() })
    if (props.form.transmission.trim()) rows.push({ icon: 'fa-solid fa-gears', label: 'Transmission', value: props.form.transmission.trim() })
    if (props.form.engine_capacity.trim()) rows.push({ icon: 'fa-solid fa-gauge', label: 'Cylindrée', value: `${props.form.engine_capacity.trim()} cm³` })
    if (mileageLabel.value) rows.push({ icon: 'fa-solid fa-road', label: 'Kilométrage', value: mileageLabel.value })
    if (props.form.manufacture_year.trim()) rows.push({ icon: 'fa-regular fa-calendar-check', label: 'Année', value: props.form.manufacture_year.trim() })
    if (props.form.purchase_date.trim()) rows.push({ icon: 'fa-regular fa-calendar', label: 'Achat', value: props.form.purchase_date.trim() })

    return rows
})
</script>

<template>
    <div class="overflow-hidden rounded-[28px] bg-surface shadow-sm ring-1 ring-neutral-100">
        <div class="relative aspect-[4/3] bg-neutral-100">
            <img
                v-if="previewUrl"
                :src="previewUrl"
                alt=""
                class="size-full object-cover"
            >
            <div
                v-else
                class="flex size-full flex-col items-center justify-center gap-2 text-neutral-400"
            >
                <i class="fa-solid fa-car text-3xl" aria-hidden="true" />
                <span class="text-sm font-medium">Aperçu photo</span>
            </div>

            <span
                class="absolute top-4 right-4 inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold shadow-sm"
                :class="form.is_active ? 'bg-primary text-white' : 'bg-neutral-900/80 text-white'"
            >
                {{ form.is_active ? 'Actif' : 'Inactif' }}
            </span>
        </div>

        <div class="flex flex-col gap-5 p-6">
            <div class="min-w-0">
                <p class="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    Aperçu
                </p>
                <h3 class="mt-1 truncate text-xl font-semibold text-neutral-950">
                    {{ title }}
                </h3>
                <p v-if="subtitle" class="mt-1 truncate text-sm text-neutral-500">
                    {{ subtitle }}
                </p>
                <p
                    v-if="form.fuel_type"
                    class="mt-3 inline-flex h-7 items-center rounded-full px-2.5 text-xs font-semibold"
                    :class="fuelTypeClass(form.fuel_type)"
                >
                    {{ fuelTypeLabel(form.fuel_type) }}
                </p>
            </div>

            <ul v-if="detailRows.length" class="flex flex-col gap-3 border-t border-neutral-100 pt-5">
                <li
                    v-for="row in detailRows"
                    :key="row.label"
                    class="flex items-start gap-3 text-sm"
                >
                    <span class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
                        <i :class="row.icon" class="text-xs" aria-hidden="true" />
                    </span>
                    <span class="min-w-0">
                        <span class="block text-xs font-medium text-neutral-400">{{ row.label }}</span>
                        <span class="flex items-center gap-2 font-semibold text-neutral-900">
                            <span
                                v-if="row.label === 'Couleur' && isHexColor(row.value)"
                                class="size-3 shrink-0 rounded-full ring-1 ring-black/10"
                                :style="{ backgroundColor: row.value }"
                                aria-hidden="true"
                            />
                            {{ row.value }}
                        </span>
                    </span>
                </li>
            </ul>

            <p v-else class="border-t border-neutral-100 pt-5 text-sm text-neutral-400">
                Remplissez le formulaire pour voir le récapitulatif.
            </p>
        </div>
    </div>
</template>
