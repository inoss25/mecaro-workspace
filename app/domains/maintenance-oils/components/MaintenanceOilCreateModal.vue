<script setup lang="ts">
import { useMaintenanceOilStore } from '../stores/maintenanceOilStore'
import { emptyMaintenanceOilForm, toMaintenanceOilCreateInput, validateMaintenanceOilForm } from '../utils/form'
import MaintenanceOilForm from './MaintenanceOilForm.vue'

const open = defineModel<boolean>({ default: false })

const toast = useToast()
const store = useMaintenanceOilStore()
const form = reactive(emptyMaintenanceOilForm())
const errors = ref<Record<string, string>>({})
const formError = computed(() => store.mutationError ? extractErrorMessage(store.mutationError) : '')

watch(open, (isOpen) => {
    if (!isOpen) return
    store.clearMutationError()
    Object.assign(form, emptyMaintenanceOilForm())
    errors.value = {}
    void store.fetchRecords()
})

async function onSubmit() {
    const next = validateMaintenanceOilForm(form)
    errors.value = next
    if (store.saving || Object.keys(next).length > 0) return
    const created = await store.create(toMaintenanceOilCreateInput(form))
    if (!created) return
    toast.success('Huile ajoutée', created.product_name || created.brand || 'Enregistrée')
    open.value = false
}
</script>

<template>
    <UiModal v-model="open" title="Nouvelle huile" description="Associez un lubrifiant à une intervention." size="lg" :close-on-overlay="!store.saving" :close-on-escape="!store.saving">
        <form id="maintenance-oil-create-form" class="flex flex-col gap-5" @submit.prevent="onSubmit">
            <p v-if="formError" class="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{{ formError }}</p>
            <MaintenanceOilForm
                v-model:record-id="form.maintenance_record_id"
                v-model:brand="form.brand"
                v-model:product-name="form.product_name"
                v-model:viscosity="form.viscosity"
                v-model:quantity="form.quantity"
                v-model:unit="form.unit"
                v-model:unit-price="form.unit_price"
                v-model:total-price="form.total_price"
                v-model:notes="form.notes"
                :records="store.records"
                :options-loading="store.optionsLoading"
                :errors="errors"
                :disabled="store.saving"
            />
        </form>
        <template #footer>
            <UiButton variant="outline" :disabled="store.saving" @click="open = false">Annuler</UiButton>
            <UiButton type="submit" form="maintenance-oil-create-form" :loading="store.saving">Enregistrer</UiButton>
        </template>
    </UiModal>
</template>
