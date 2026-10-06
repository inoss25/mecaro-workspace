<script setup lang="ts">
import { slugifyVehicleTypeKey, type VehicleTypeFormState } from '../utils/form'

const props = withDefaults(defineProps<{
    errors?: Record<string, string>
    disabled?: boolean
    autoKey?: boolean
}>(), {
    errors: () => ({}),
    disabled: false,
    autoKey: false,
})

const name = defineModel<VehicleTypeFormState['name']>('name', { required: true })
const typeKey = defineModel<VehicleTypeFormState['key']>('typeKey', { required: true })
const icon = defineModel<VehicleTypeFormState['icon']>('icon', { required: true })
const isActive = defineModel<VehicleTypeFormState['is_active']>('isActive', { required: true })

const keyTouched = ref(false)

watch(name, (value) => {
    if (!props.autoKey || keyTouched.value) return
    typeKey.value = slugifyVehicleTypeKey(value)
})

watch(typeKey, (value) => {
    if (!props.autoKey || keyTouched.value) return
    if (value !== slugifyVehicleTypeKey(name.value)) keyTouched.value = true
})
</script>

<template>
    <div class="flex flex-col gap-5">
        <UiInput
            v-model="name"
            name="name"
            label="Nom"
            placeholder="Voiture"
            icon="fa-solid fa-tag"
            :error="errors.name"
            :disabled="disabled"
            data-autofocus
        />

        <UiInput
            v-model="typeKey"
            name="key"
            label="Clé"
            placeholder="voiture"
            icon="fa-solid fa-key"
            hint="Identifiant technique, par exemple voiture."
            :error="errors.key"
            :disabled="disabled"
        />

        <UiInput
            v-model="icon"
            name="icon"
            label="Icône"
            placeholder="fa-solid fa-car"
            icon="fa-regular fa-image"
            hint="Classe Font Awesome, par exemple fa-solid fa-car."
            :error="errors.icon"
            :disabled="disabled"
        >
            <template v-if="icon.trim()" #trailing>
                <i :class="icon" class="text-neutral-600" aria-hidden="true" />
            </template>
        </UiInput>

        <UiSwitch
            v-model="isActive"
            name="is_active"
            label="Actif"
            description="Ce type peut être choisi pour classer un engin."
            :disabled="disabled"
        />
    </div>
</template>
