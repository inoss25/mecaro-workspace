<script setup lang="ts">
import { useMaintenancePartStore } from '../stores/maintenancePartStore'
import type { MaintenancePart } from '../types'
import { emptyMaintenancePartForm, formFromMaintenancePart, toMaintenancePartUpdateInput, validateMaintenancePartForm } from '../utils/form'
import MaintenancePartForm from './MaintenancePartForm.vue'

const open = defineModel<boolean>({ default: false })
const props = defineProps<{ part: MaintenancePart | null }>()
const toast = useToast()
const store = useMaintenancePartStore()
const form = reactive(emptyMaintenancePartForm())
const errors = ref<Record<string, string>>({})
const formError = computed(() => store.mutationError ? extractErrorMessage(store.mutationError) : '')

watch(open, async (isOpen) => {
    if (!isOpen || !props.part) return
    store.clearMutationError()
    void store.fetchRecords()
    const baseline = formFromMaintenancePart(props.part)
    Object.assign(form, baseline)
    errors.value = {}
    const fresh = await store.find(props.part.id)
    if (!open.value || !fresh || fresh.id !== props.part.id) return
    const unchanged = (Object.keys(baseline) as (keyof typeof baseline)[]).every(key => form[key] === baseline[key])
    if (unchanged) Object.assign(form, formFromMaintenancePart(fresh))
})

async function onSubmit() {
    if (!props.part) return
    const next = validateMaintenancePartForm(form)
    errors.value = next
    if (store.saving || Object.keys(next).length > 0) return
    const updated = await store.update(props.part.id, toMaintenancePartUpdateInput(form))
    if (!updated) return
    toast.success('Pièce modifiée', updated.name)
    open.value = false
}
</script>

<template>
    <UiModal v-model="open" title="Modifier la pièce" description="Mettez à jour la référence, la quantité et le montant." size="lg" :close-on-overlay="!store.saving" :close-on-escape="!store.saving">
        <form id="maintenance-part-edit-form" class="flex flex-col gap-5" @submit.prevent="onSubmit">
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
            <UiButton type="submit" form="maintenance-part-edit-form" :loading="store.saving" :disabled="!part">Enregistrer</UiButton>
        </template>
    </UiModal>
</template>
