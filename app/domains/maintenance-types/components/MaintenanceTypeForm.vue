<script setup lang="ts">
import type { MaintenanceCategory } from '../../maintenance-categories/types'
import type { MaintenanceTypeFormState } from '../utils/form'

const props = withDefaults(defineProps<{
    errors?: Record<string, string>
    disabled?: boolean
    categories?: MaintenanceCategory[]
    optionsLoading?: boolean
}>(), {
    errors: () => ({}),
    disabled: false,
    categories: () => [],
    optionsLoading: false,
})

const categoryId = defineModel<MaintenanceTypeFormState['maintenance_category_id']>('categoryId', { required: true })
const name = defineModel<MaintenanceTypeFormState['name']>('name', { required: true })
const description = defineModel<MaintenanceTypeFormState['description']>('description', { required: true })
const icon = defineModel<MaintenanceTypeFormState['icon']>('icon', { required: true })
const isActive = defineModel<MaintenanceTypeFormState['is_active']>('isActive', { required: true })

const categorySelectId = useId()

const categoryChoices = computed(() => {
    const active = props.categories.filter(category => category.is_active)
    const current = props.categories.find(category => category.id === categoryId.value)
    if (current && !current.is_active) return [current, ...active]
    return active
})
</script>

<template>
    <div class="flex flex-col gap-5">
        <div class="flex flex-col gap-2">
            <label :for="categorySelectId" class="text-sm font-semibold text-neutral-900">
                Catégorie
            </label>
            <div class="relative">
                <select
                    :id="categorySelectId"
                    v-model="categoryId"
                    name="maintenance_category_id"
                    class="h-11 w-full appearance-none rounded-2xl border border-neutral-200 bg-white px-4 pr-10 text-sm text-neutral-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="disabled || optionsLoading"
                    :aria-invalid="errors.maintenance_category_id ? 'true' : undefined"
                >
                    <option value="" disabled>
                        {{ optionsLoading ? 'Chargement…' : 'Choisir une catégorie' }}
                    </option>
                    <option
                        v-for="category in categoryChoices"
                        :key="category.id"
                        :value="category.id"
                    >
                        {{ category.name }}
                    </option>
                </select>
                <i class="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs text-neutral-400" aria-hidden="true" />
            </div>
            <p v-if="errors.maintenance_category_id" class="text-sm text-red-600" role="alert">
                {{ errors.maintenance_category_id }}
            </p>
        </div>

        <UiInput
            v-model="name"
            name="name"
            label="Nom"
            placeholder="Vidange moteur"
            icon="fa-solid fa-list-check"
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
            placeholder="Opération d’entretien"
            :disabled="disabled"
        />

        <UiSwitch
            v-model="isActive"
            name="is_active"
            label="Actif"
            description="Ce type peut être choisi pour une intervention."
            :disabled="disabled"
        />
    </div>
</template>
