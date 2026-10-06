<script setup lang="ts">
import { useMaintenanceCategoryStore } from '../stores/maintenanceCategoryStore'
import type { MaintenanceCategory } from '../types'
import { emptyMaintenanceCategoryForm, formFromMaintenanceCategory, toMaintenanceCategoryUpdateInput, validateMaintenanceCategoryForm } from '../utils/form'
import MaintenanceCategoryForm from './MaintenanceCategoryForm.vue'

const open = defineModel<boolean>({ default: false })

const props = defineProps<{
    category: MaintenanceCategory | null
}>()

const toast = useToast()
const store = useMaintenanceCategoryStore()

const form = reactive(emptyMaintenanceCategoryForm())
const errors = ref<Record<string, string>>({})
const formError = computed(() => store.mutationError ? extractErrorMessage(store.mutationError) : '')

watch(open, async (isOpen) => {
    if (!isOpen || !props.category) return
    store.clearMutationError()
    const baseline = formFromMaintenanceCategory(props.category)
    Object.assign(form, baseline)
    errors.value = {}

    const fresh = await store.find(props.category.id)
    if (!open.value || !fresh || fresh.id !== props.category.id) return

    const unchanged = (Object.keys(baseline) as (keyof typeof baseline)[]).every(key => form[key] === baseline[key])
    if (unchanged) Object.assign(form, formFromMaintenanceCategory(fresh))
})

async function onSubmit() {
    if (!props.category) return

    const next = validateMaintenanceCategoryForm(form)
    errors.value = next
    if (store.saving || Object.keys(next).length > 0) return

    const updated = await store.update(props.category.id, toMaintenanceCategoryUpdateInput(form))
    if (!updated) return

    toast.success('Catégorie modifiée', `${updated.name} a été mise à jour.`)
    open.value = false
}
</script>

<template>
    <UiModal
        v-model="open"
        title="Modifier la catégorie"
        description="Mettez à jour le nom, l’icône et le statut."
        size="md"
        :close-on-overlay="!store.saving"
        :close-on-escape="!store.saving"
    >
        <form id="maintenance-category-edit-form" class="flex flex-col gap-5" @submit.prevent="onSubmit">
            <p
                v-if="formError"
                class="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
            >
                {{ formError }}
            </p>

            <MaintenanceCategoryForm
                v-model:name="form.name"
                v-model:icon="form.icon"
                v-model:description="form.description"
                v-model:is-active="form.is_active"
                :errors="errors"
                :disabled="store.saving"
            />
        </form>

        <template #footer>
            <UiButton variant="outline" :disabled="store.saving" @click="open = false">
                Annuler
            </UiButton>
            <UiButton type="submit" form="maintenance-category-edit-form" :loading="store.saving" :disabled="!category">
                Enregistrer
            </UiButton>
        </template>
    </UiModal>
</template>
