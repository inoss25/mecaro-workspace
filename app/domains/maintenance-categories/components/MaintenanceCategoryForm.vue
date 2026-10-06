<script setup lang="ts">
import type { MaintenanceCategoryFormState } from '../utils/form'

withDefaults(defineProps<{
    errors?: Record<string, string>
    disabled?: boolean
}>(), {
    errors: () => ({}),
    disabled: false,
})

const name = defineModel<MaintenanceCategoryFormState['name']>('name', { required: true })
const icon = defineModel<MaintenanceCategoryFormState['icon']>('icon', { required: true })
const description = defineModel<MaintenanceCategoryFormState['description']>('description', { required: true })
const isActive = defineModel<MaintenanceCategoryFormState['is_active']>('isActive', { required: true })
</script>

<template>
    <div class="flex flex-col gap-5">
        <UiInput
            v-model="name"
            name="name"
            label="Nom"
            placeholder="Vidange"
            icon="fa-solid fa-layer-group"
            :error="errors.name"
            :disabled="disabled"
            data-autofocus
        />

        <UiInput
            v-model="icon"
            name="icon"
            label="Icône"
            placeholder="fa-solid fa-oil-can"
            icon="fa-regular fa-image"
            hint="Classe Font Awesome, par exemple fa-solid fa-oil-can."
            :disabled="disabled"
        >
            <template v-if="icon.trim()" #trailing>
                <i :class="icon" class="text-neutral-600" aria-hidden="true" />
            </template>
        </UiInput>

        <UiTextarea
            v-model="description"
            name="description"
            label="Description"
            placeholder="Famille d’opérations d’entretien"
            :disabled="disabled"
        />

        <UiSwitch
            v-model="isActive"
            name="is_active"
            label="Active"
            description="Cette catégorie peut être utilisée pour classer des types."
            :disabled="disabled"
        />
    </div>
</template>
