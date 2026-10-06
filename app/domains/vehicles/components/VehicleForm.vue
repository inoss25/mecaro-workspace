<script setup lang="ts">
import type { User } from '../../users/types'
import type { VehicleBrand } from '../../vehicle-brands/types'
import type { VehicleModel } from '../../vehicle-models/types'
import type { VehicleType } from '../../vehicle-types/types'
import { useVehicleStore } from '../stores/vehicleStore'
import { FUEL_TYPE_OPTIONS } from '../utils/options'
import { validateVehicleImage, type VehicleBrandSource, type VehicleFormState } from '../utils/form'

const props = withDefaults(defineProps<{
    errors?: Record<string, string>
    disabled?: boolean
    mode?: 'create' | 'edit'
    imageUrl?: string | null
    ownerName?: string
    users?: User[]
    vehicleTypes?: VehicleType[]
    vehicleBrands?: VehicleBrand[]
    vehicleModels?: VehicleModel[]
    optionsLoading?: boolean
    modelsLoading?: boolean
}>(), {
    errors: () => ({}),
    disabled: false,
    mode: 'create',
    imageUrl: '',
    ownerName: '',
    users: () => [],
    vehicleTypes: () => [],
    vehicleBrands: () => [],
    vehicleModels: () => [],
    optionsLoading: false,
    modelsLoading: false,
})

const userId = defineModel<VehicleFormState['user_id']>('userId', { required: true })
const vehicleTypeId = defineModel<VehicleFormState['vehicle_type_id']>('vehicleTypeId', { required: true })
const brandSource = defineModel<VehicleBrandSource>('brandSource', { required: true })
const vehicleBrandId = defineModel<VehicleFormState['vehicle_brand_id']>('vehicleBrandId', { required: true })
const vehicleModelId = defineModel<VehicleFormState['vehicle_model_id']>('vehicleModelId', { required: true })
const customBrandName = defineModel<VehicleFormState['custom_brand_name']>('customBrandName', { required: true })
const customModelName = defineModel<VehicleFormState['custom_model_name']>('customModelName', { required: true })
const name = defineModel<VehicleFormState['name']>('name', { required: true })
const registrationNumber = defineModel<VehicleFormState['registration_number']>('registrationNumber', { required: true })
const fuelType = defineModel<VehicleFormState['fuel_type']>('fuelType', { required: true })
const color = defineModel<VehicleFormState['color']>('color', { required: true })
const engineCapacity = defineModel<VehicleFormState['engine_capacity']>('engineCapacity', { required: true })
const transmission = defineModel<VehicleFormState['transmission']>('transmission', { required: true })
const purchaseDate = defineModel<VehicleFormState['purchase_date']>('purchaseDate', { required: true })
const manufactureYear = defineModel<VehicleFormState['manufacture_year']>('manufactureYear', { required: true })
const initialMileage = defineModel<VehicleFormState['initial_mileage']>('initialMileage', { required: true })
const currentMileage = defineModel<VehicleFormState['current_mileage']>('currentMileage', { required: true })
const isActive = defineModel<VehicleFormState['is_active']>('isActive', { required: true })
const imageFile = defineModel<File | null>('imageFile', { default: null })
const imageError = defineModel<string>('imageError', { default: '' })

const store = useVehicleStore()
const userSelectId = useId()
const typeSelectId = useId()
const brandSelectId = useId()
const modelSelectId = useId()
const imageInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref('')
const shownImage = computed(() => previewUrl.value || props.imageUrl || '')
const typeChoices = computed(() => {
    const active = props.vehicleTypes.filter(type => type.is_active)
    const current = props.vehicleTypes.find(type => type.id === vehicleTypeId.value)
    if (current && !current.is_active) return [current, ...active]
    return active
})
const brandChoices = computed(() => {
    const active = props.vehicleBrands.filter(brand => brand.is_active)
    const current = props.vehicleBrands.find(brand => brand.id === vehicleBrandId.value)
    if (current && !current.is_active) return [current, ...active]
    return active
})
const modelChoices = computed(() => {
    const active = props.vehicleModels.filter(model => model.is_active)
    const current = props.vehicleModels.find(model => model.id === vehicleModelId.value)
    if (current && !current.is_active) return [current, ...active]
    return active
})
const imageMessage = computed(() => imageError.value || props.errors.image || '')

watch([brandSource, vehicleBrandId], ([source, brandId]) => {
    if (source !== 'catalog') return
    void store.fetchModelsForBrand(brandId)
})

watch(vehicleBrandId, (next, previous) => {
    if (brandSource.value !== 'catalog' || next === previous) return
    vehicleModelId.value = ''
})

watch(imageFile, (file) => {
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = file ? URL.createObjectURL(file) : ''
})

onBeforeUnmount(() => {
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})

function clearImage() {
    imageFile.value = null
    imageError.value = ''
    if (imageInput.value) imageInput.value.value = ''
}

function onImageChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) {
        clearImage()
        return
    }

    const message = validateVehicleImage(file)
    if (message) {
        imageError.value = message
        imageFile.value = null
        if (imageInput.value) imageInput.value.value = ''
        return
    }

    imageError.value = ''
    imageFile.value = file
}
</script>

<template>
    <div class="grid gap-5 sm:grid-cols-2">
        <div v-if="mode === 'create'" class="flex flex-col gap-2 sm:col-span-2">
            <label :for="userSelectId" class="text-sm font-semibold text-neutral-900">
                Propriétaire
            </label>
            <div
                class="flex items-center gap-3 rounded-full bg-neutral-100 px-4 transition-[box-shadow,background-color] duration-150 focus-within:bg-surface focus-within:ring-2 focus-within:ring-primary/30"
                :class="[
                    errors.user_id && 'ring-2 ring-red-400',
                    (disabled || optionsLoading) && 'opacity-60',
                ]"
            >
                <i class="fa-solid fa-user text-neutral-400" aria-hidden="true" />
                <select
                    :id="userSelectId"
                    v-model="userId"
                    name="user_id"
                    class="h-12 min-w-0 flex-1 appearance-none bg-transparent text-sm text-neutral-900 outline-none disabled:cursor-not-allowed"
                    :disabled="disabled || optionsLoading"
                >
                    <option value="" disabled>
                        Choisir un propriétaire
                    </option>
                    <option
                        v-for="user in users"
                        :key="user.id"
                        :value="user.id"
                    >
                        {{ user.name }}
                    </option>
                </select>
                <i class="fa-solid fa-chevron-down text-[10px] text-neutral-400" aria-hidden="true" />
            </div>
            <p v-if="errors.user_id" class="text-sm text-red-600">
                {{ errors.user_id }}
            </p>
        </div>

        <div v-else class="flex flex-col gap-2 sm:col-span-2">
            <p class="text-sm font-semibold text-neutral-900">
                Propriétaire
            </p>
            <p class="flex h-12 items-center gap-3 rounded-full bg-neutral-100 px-4 text-sm text-neutral-700">
                <i class="fa-solid fa-user text-neutral-400" aria-hidden="true" />
                {{ ownerName || '—' }}
            </p>
        </div>

        <div class="flex flex-col gap-2 sm:col-span-2">
            <label :for="typeSelectId" class="text-sm font-semibold text-neutral-900">
                Type de véhicule
            </label>
            <div
                class="flex items-center gap-3 rounded-full bg-neutral-100 px-4 transition-[box-shadow,background-color] duration-150 focus-within:bg-surface focus-within:ring-2 focus-within:ring-primary/30"
                :class="[
                    errors.vehicle_type_id && 'ring-2 ring-red-400',
                    (disabled || optionsLoading) && 'opacity-60',
                ]"
            >
                <i class="fa-solid fa-tags text-neutral-400" aria-hidden="true" />
                <select
                    :id="typeSelectId"
                    v-model="vehicleTypeId"
                    name="vehicle_type_id"
                    class="h-12 min-w-0 flex-1 appearance-none bg-transparent text-sm text-neutral-900 outline-none disabled:cursor-not-allowed"
                    :disabled="disabled || optionsLoading"
                >
                    <option value="" disabled>
                        Choisir un type
                    </option>
                    <option
                        v-for="type in typeChoices"
                        :key="type.id"
                        :value="type.id"
                    >
                        {{ type.name }}
                    </option>
                </select>
                <i class="fa-solid fa-chevron-down text-[10px] text-neutral-400" aria-hidden="true" />
            </div>
            <p v-if="errors.vehicle_type_id" class="text-sm text-red-600">
                {{ errors.vehicle_type_id }}
            </p>
        </div>

        <fieldset class="sm:col-span-2">
            <legend class="text-sm font-semibold text-neutral-900">
                Marque et modèle
            </legend>
            <div class="mt-2 flex flex-wrap gap-2">
                <button
                    type="button"
                    class="h-10 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
                    :class="brandSource === 'catalog'
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'"
                    :aria-pressed="brandSource === 'catalog'"
                    :disabled="disabled"
                    @click="brandSource = 'catalog'"
                >
                    Catalogue
                </button>
                <button
                    type="button"
                    class="h-10 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
                    :class="brandSource === 'custom'
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'"
                    :aria-pressed="brandSource === 'custom'"
                    :disabled="disabled"
                    @click="brandSource = 'custom'"
                >
                    Saisie libre
                </button>
            </div>
        </fieldset>

        <template v-if="brandSource === 'catalog'">
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
                    >
                        <option value="" disabled>
                            Choisir une marque
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
                <p v-if="errors.vehicle_brand_id" class="text-sm text-red-600">
                    {{ errors.vehicle_brand_id }}
                </p>
            </div>

            <div class="flex flex-col gap-2">
                <label :for="modelSelectId" class="text-sm font-semibold text-neutral-900">
                    Modèle
                </label>
                <div class="relative">
                    <select
                        :id="modelSelectId"
                        v-model="vehicleModelId"
                        name="vehicle_model_id"
                        class="h-11 w-full appearance-none rounded-2xl border border-neutral-200 bg-white px-4 pr-10 text-sm text-neutral-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                        :disabled="disabled || optionsLoading || modelsLoading || !vehicleBrandId"
                    >
                        <option value="" disabled>
                            {{ modelsLoading ? 'Chargement…' : 'Choisir un modèle' }}
                        </option>
                        <option
                            v-for="model in modelChoices"
                            :key="model.id"
                            :value="model.id"
                        >
                            {{ model.name }}
                        </option>
                    </select>
                    <i class="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs text-neutral-400" aria-hidden="true" />
                </div>
                <p v-if="errors.vehicle_model_id" class="text-sm text-red-600">
                    {{ errors.vehicle_model_id }}
                </p>
            </div>
        </template>

        <template v-else>
            <UiInput
                v-model="customBrandName"
                name="custom_brand_name"
                label="Marque"
                placeholder="Toyota"
                icon="fa-solid fa-industry"
                :error="errors.custom_brand_name"
                :disabled="disabled"
                data-autofocus
            />

            <UiInput
                v-model="customModelName"
                name="custom_model_name"
                label="Modèle"
                placeholder="Corolla"
                icon="fa-solid fa-car-side"
                :error="errors.custom_model_name"
                :disabled="disabled"
            />
        </template>

        <UiInput
            v-model="name"
            name="name"
            label="Nom"
            placeholder="Voiture de service"
            icon="fa-regular fa-pen-to-square"
            hint="Facultatif. Sinon la marque et le modèle sont affichés."
            :error="errors.name"
            :disabled="disabled"
        />

        <UiInput
            v-model="registrationNumber"
            name="registration_number"
            label="Immatriculation"
            placeholder="AB 1234 BF"
            icon="fa-regular fa-id-card"
            :error="errors.registration_number"
            :disabled="disabled"
        />

        <fieldset class="sm:col-span-2">
            <legend class="text-sm font-semibold text-neutral-900">
                Carburant
            </legend>
            <div class="mt-2 flex flex-wrap gap-2">
                <button
                    v-for="option in FUEL_TYPE_OPTIONS"
                    :key="option.value"
                    type="button"
                    class="h-10 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
                    :class="fuelType === option.value
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'"
                    :aria-pressed="fuelType === option.value"
                    :disabled="disabled"
                    @click="fuelType = option.value"
                >
                    {{ option.label }}
                </button>
            </div>
            <p v-if="errors.fuel_type" class="mt-2 text-sm text-red-600">
                {{ errors.fuel_type }}
            </p>
        </fieldset>

        <UiInput
            v-model="color"
            name="color"
            label="Couleur"
            placeholder="Blanc"
            icon="fa-solid fa-palette"
            :error="errors.color"
            :disabled="disabled"
        />

        <UiInput
            v-model="engineCapacity"
            name="engine_capacity"
            label="Cylindrée (cm³)"
            placeholder="1600"
            icon="fa-solid fa-gauge"
            :error="errors.engine_capacity"
            :disabled="disabled"
        />

        <UiInput
            v-model="transmission"
            name="transmission"
            label="Transmission"
            placeholder="Manuelle"
            icon="fa-solid fa-gears"
            :error="errors.transmission"
            :disabled="disabled"
        />

        <UiInput
            v-model="purchaseDate"
            name="purchase_date"
            type="date"
            label="Date d’achat"
            icon="fa-regular fa-calendar"
            :disabled="disabled"
        />

        <UiInput
            v-model="manufactureYear"
            name="manufacture_year"
            label="Année de fabrication"
            placeholder="2020"
            icon="fa-regular fa-calendar-check"
            :error="errors.manufacture_year"
            :disabled="disabled"
        />

        <UiInput
            v-model="initialMileage"
            name="initial_mileage"
            label="Kilométrage initial"
            placeholder="0"
            icon="fa-solid fa-road"
            :error="errors.initial_mileage"
            :disabled="disabled"
        />

        <UiInput
            v-model="currentMileage"
            name="current_mileage"
            label="Kilométrage actuel"
            placeholder="45000"
            icon="fa-solid fa-road"
            :error="errors.current_mileage"
            :disabled="disabled"
        />

        <div class="flex items-end">
            <UiSwitch
                v-model="isActive"
                name="is_active"
                label="Actif"
                description="Ce véhicule peut être utilisé dans l’atelier."
                :disabled="disabled"
            />
        </div>

        <div class="flex flex-col gap-2 sm:col-span-2">
            <p class="text-sm font-semibold text-neutral-900">
                Image
            </p>
            <div class="flex flex-wrap items-center gap-4">
                <span class="flex size-14 items-center justify-center overflow-hidden rounded-2xl bg-neutral-100 text-sm font-semibold text-neutral-400">
                    <img
                        v-if="shownImage"
                        :src="shownImage"
                        alt=""
                        class="size-full object-cover"
                    >
                    <i v-else class="fa-regular fa-image" />
                </span>
                <label
                    class="inline-flex h-10 cursor-pointer items-center rounded-full bg-neutral-100 px-4 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-200"
                    :class="disabled && 'pointer-events-none opacity-60'"
                >
                    Choisir une image
                    <input
                        ref="imageInput"
                        type="file"
                        accept="image/*"
                        class="sr-only"
                        :disabled="disabled"
                        @change="onImageChange"
                    >
                </label>
                <button
                    v-if="imageFile"
                    type="button"
                    class="text-sm font-semibold text-neutral-500 transition-colors hover:text-neutral-800"
                    :disabled="disabled"
                    @click="clearImage"
                >
                    Retirer
                </button>
            </div>
            <p v-if="imageMessage" class="text-sm text-red-600">
                {{ imageMessage }}
            </p>
            <p v-else class="text-sm text-neutral-500">
                JPG ou PNG, 2 Mo maximum. Facultatif.
            </p>
        </div>
    </div>
</template>
