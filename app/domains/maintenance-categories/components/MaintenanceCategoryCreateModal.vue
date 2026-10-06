<script setup lang="ts">
import { useMaintenanceCategoryStore } from '../stores/maintenanceCategoryStore'
import { emptyMaintenanceCategoryForm, toMaintenanceCategoryCreateInput, validateMaintenanceCategoryForm } from '../utils/form'
import MaintenanceCategoryForm from './MaintenanceCategoryForm.vue'

const open = defineModel<boolean>({ default: false })

const toast = useToast()
const store = useMaintenanceCategoryStore()

const form = reactive(emptyMaintenanceCategoryForm())
const errors = ref<Record<string, string>>({})
const formError = computed(() => store.mutationError ? extractErrorMessage(store.mutationError) : '')

watch(open, (isOpen) => {
    if (!isOpen) return
    store.clearMutationError()
    Object.assign(form, emptyMaintenanceCategoryForm())
    errors.value = {}
})

async function onSubmit() {
    const next = validateMaintenanceCategoryForm(form)
    errors.value = next
    if (store.saving || Object.keys(next).length > 0) return

    const created = await store.create(toMaintenanceCategoryCreateInput(form))
    if (!created) return

    toast.success('Catégorie créée', `${created.name} a été ajoutée.`)
    open.value = false
}
</script>

<template>
    <UiModal
        v-model="open"
        title="Nouvelle catégorie"
        description="Regroupez les types d’entretien sous une même famille."
        size="md"
        :close-on-overlay="!store.saving"
        :close-on-escape="!store.saving"
    >
        <form id="maintenance-category-create-form" class="flex flex-col gap-5" @submit.prevent="onSubmit">
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
            <UiButton type="submit" form="maintenance-category-create-form" :loading="store.saving">
                Créer la catégorie
            </UiButton>
        </template>
    </UiModal>
</template>
