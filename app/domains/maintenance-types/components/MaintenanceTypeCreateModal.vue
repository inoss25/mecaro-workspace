<script setup lang="ts">
import { useMaintenanceTypeStore } from '../stores/maintenanceTypeStore'
import { emptyMaintenanceTypeForm, toMaintenanceTypeCreateInput, validateMaintenanceTypeForm } from '../utils/form'
import MaintenanceTypeForm from './MaintenanceTypeForm.vue'

const open = defineModel<boolean>({ default: false })

const toast = useToast()
const store = useMaintenanceTypeStore()

const form = reactive(emptyMaintenanceTypeForm())
const errors = ref<Record<string, string>>({})
const formError = computed(() => store.mutationError ? extractErrorMessage(store.mutationError) : '')

watch(open, (isOpen) => {
    if (!isOpen) return
    store.clearMutationError()
    Object.assign(form, emptyMaintenanceTypeForm())
    errors.value = {}
    void store.fetchCategories()
})

async function onSubmit() {
    const next = validateMaintenanceTypeForm(form)
    errors.value = next
    if (store.saving || Object.keys(next).length > 0) return

    const created = await store.create(toMaintenanceTypeCreateInput(form))
    if (!created) return

    toast.success('Type créé', `${created.name} a été ajouté.`)
    open.value = false
}
</script>

<template>
    <UiModal
        v-model="open"
        title="Nouveau type"
        description="Définissez une opération d’entretien dans une catégorie."
        size="md"
        :close-on-overlay="!store.saving"
        :close-on-escape="!store.saving"
    >
        <form id="maintenance-type-create-form" class="flex flex-col gap-5" @submit.prevent="onSubmit">
            <p
                v-if="formError"
                class="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
            >
                {{ formError }}
            </p>

            <MaintenanceTypeForm
                v-model:category-id="form.maintenance_category_id"
                v-model:name="form.name"
                v-model:description="form.description"
                v-model:icon="form.icon"
                v-model:is-active="form.is_active"
                :categories="store.categories"
                :options-loading="store.optionsLoading"
                :errors="errors"
                :disabled="store.saving"
            />
        </form>

        <template #footer>
            <UiButton variant="outline" :disabled="store.saving" @click="open = false">
                Annuler
            </UiButton>
            <UiButton type="submit" form="maintenance-type-create-form" :loading="store.saving">
                Créer le type
            </UiButton>
        </template>
    </UiModal>
</template>
