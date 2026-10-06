<script setup lang="ts">
import { useMaintenancePartStore } from '../stores/maintenancePartStore'
import { emptyMaintenancePartForm, toMaintenancePartCreateInput, validateMaintenancePartForm } from '../utils/form'
import MaintenancePartForm from './MaintenancePartForm.vue'

const open = defineModel<boolean>({ default: false })
const toast = useToast()
const store = useMaintenancePartStore()
const form = reactive(emptyMaintenancePartForm())
const errors = ref<Record<string, string>>({})
const formError = computed(() => store.mutationError ? extractErrorMessage(store.mutationError) : '')

watch(open, (isOpen) => {
    if (!isOpen) return
    store.clearMutationError()
    Object.assign(form, emptyMaintenancePartForm())
    errors.value = {}
    void store.fetchRecords()
})

async function onSubmit() {
    const next = validateMaintenancePartForm(form)
    errors.value = next
    if (store.saving || Object.keys(next).length > 0) return
    const created = await store.create(toMaintenancePartCreateInput(form))
    if (!created) return
    toast.success('Pièce ajoutée', created.name)
    open.value = false
}
</script>

<template>
    <UiModal v-model="open" title="Nouvelle pièce" description="Associez une pièce à une intervention." size="lg" :close-on-overlay="!store.saving" :close-on-escape="!store.saving">
        <form id="maintenance-part-create-form" class="flex flex-col gap-5" @submit.prevent="onSubmit">
            <p v-if="formError" class="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{{ formError }}</p>
            <MaintenancePartForm
                v-model:record-id="form.maintenance_record_id"
                v-model:name="form.name"
                v-model:reference="form.reference"
                v-model:quantity="form.quantity"
                v-model:unit-price="form.unit_price"
                v-model:total-price="form.total_price"
                v-model:brand="form.brand"
                v-model:notes="form.notes"
                :records="store.records"
                :options-loading="store.optionsLoading"
                :errors="errors"
                :disabled="store.saving"
            />
        </form>
        <template #footer>
            <UiButton variant="outline" :disabled="store.saving" @click="open = false">Annuler</UiButton>
            <UiButton type="submit" form="maintenance-part-create-form" :loading="store.saving">Enregistrer</UiButton>
        </template>
    </UiModal>
</template>
