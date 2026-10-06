<script setup lang="ts">
import { useMaintenanceOilStore } from '../stores/maintenanceOilStore'
import type { MaintenanceOil } from '../types'
import { emptyMaintenanceOilForm, formFromMaintenanceOil, toMaintenanceOilUpdateInput, validateMaintenanceOilForm } from '../utils/form'
import MaintenanceOilForm from './MaintenanceOilForm.vue'

const open = defineModel<boolean>({ default: false })
const props = defineProps<{ oil: MaintenanceOil | null }>()

const toast = useToast()
const store = useMaintenanceOilStore()
const form = reactive(emptyMaintenanceOilForm())
const errors = ref<Record<string, string>>({})
const formError = computed(() => store.mutationError ? extractErrorMessage(store.mutationError) : '')

watch(open, async (isOpen) => {
    if (!isOpen || !props.oil) return
    store.clearMutationError()
    void store.fetchRecords()
    const baseline = formFromMaintenanceOil(props.oil)
    Object.assign(form, baseline)
    errors.value = {}
    const fresh = await store.find(props.oil.id)
    if (!open.value || !fresh || fresh.id !== props.oil.id) return
    const unchanged = (Object.keys(baseline) as (keyof typeof baseline)[]).every(key => form[key] === baseline[key])
    if (unchanged) Object.assign(form, formFromMaintenanceOil(fresh))
})

async function onSubmit() {
    if (!props.oil) return
    const next = validateMaintenanceOilForm(form)
    errors.value = next
    if (store.saving || Object.keys(next).length > 0) return
    const updated = await store.update(props.oil.id, toMaintenanceOilUpdateInput(form))
    if (!updated) return
    toast.success('Huile modifiée', updated.product_name || updated.brand || 'Mise à jour')
    open.value = false
}
</script>

<template>
    <UiModal v-model="open" title="Modifier l’huile" description="Mettez à jour le produit, la quantité et le montant." size="lg" :close-on-overlay="!store.saving" :close-on-escape="!store.saving">
        <form id="maintenance-oil-edit-form" class="flex flex-col gap-5" @submit.prevent="onSubmit">
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
            <UiButton type="submit" form="maintenance-oil-edit-form" :loading="store.saving" :disabled="!oil">Enregistrer</UiButton>
        </template>
    </UiModal>
</template>
