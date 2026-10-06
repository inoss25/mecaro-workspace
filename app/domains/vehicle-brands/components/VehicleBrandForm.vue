<script setup lang="ts">
import { slugifyVehicleBrandKey, validateVehicleBrandLogo, type VehicleBrandFormState } from '../utils/form'

const props = withDefaults(defineProps<{
    errors?: Record<string, string>
    disabled?: boolean
    logoSrc?: string | null
    autoKey?: boolean
}>(), {
    errors: () => ({}),
    disabled: false,
    logoSrc: '',
    autoKey: false,
})

const name = defineModel<VehicleBrandFormState['name']>('name', { required: true })
const brandKey = defineModel<VehicleBrandFormState['key']>('brandKey', { required: true })
const isActive = defineModel<VehicleBrandFormState['is_active']>('isActive', { required: true })
const logoFile = defineModel<File | null>('logoFile', { default: null })
const logoError = defineModel<string>('logoError', { default: '' })

const keyTouched = ref(false)
const logoMessage = computed(() => logoError.value || props.errors.logo || '')

watch(name, (value) => {
    if (!props.autoKey || keyTouched.value) return
    brandKey.value = slugifyVehicleBrandKey(value)
})

watch(brandKey, (value) => {
    if (!props.autoKey || keyTouched.value) return
    if (value !== slugifyVehicleBrandKey(name.value)) keyTouched.value = true
})

watch(logoFile, (file) => {
    if (!file) {
        logoError.value = ''
        return
    }

    const message = validateVehicleBrandLogo(file)
    if (message) {
        logoError.value = message
        logoFile.value = null
    }
    else {
        logoError.value = ''
    }
})
</script>

<template>
    <div class="flex flex-col gap-5">
        <UiImageUpload
            v-model="logoFile"
            label="Logo"
            hint="PNG ou JPG, 2 Mo maximum."
            shape="rounded"
            :src="logoSrc"
            :error="logoMessage"
            :disabled="disabled"
        />

        <UiInput
            v-model="name"
            name="name"
            label="Nom"
            placeholder="Toyota"
            icon="fa-solid fa-industry"
            :error="errors.name"
            :disabled="disabled"
            data-autofocus
        />

        <UiInput
            v-model="brandKey"
            name="key"
            label="Clé"
            placeholder="toyota"
            icon="fa-solid fa-key"
            hint="Identifiant technique, par exemple toyota."
            :error="errors.key"
            :disabled="disabled"
        />

        <UiSwitch
            v-model="isActive"
            name="is_active"
            label="Active"
            description="Cette marque peut être sélectionnée pour les modèles et véhicules."
            :disabled="disabled"
        />
    </div>
</template>
