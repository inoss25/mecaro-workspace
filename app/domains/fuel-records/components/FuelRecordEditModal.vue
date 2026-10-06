<script setup lang="ts">
import { useFuelRecordStore } from '../stores/fuelRecordStore'
import type { FuelRecord } from '../types'
import { emptyFuelRecordForm, formFromFuelRecord, toFuelRecordUpdateInput, validateFuelRecordForm } from '../utils/form'
import { fuelRecordSummary } from '../utils/options'
import FuelRecordForm from './FuelRecordForm.vue'

const open = defineModel<boolean>({ default: false })

const props = defineProps<{
    fuelRecord: FuelRecord | null
    lockVehicle?: boolean
}>()

const toast = useToast()
const store = useFuelRecordStore()

const form = reactive(emptyFuelRecordForm())
const errors = ref<Record<string, string>>({})
const formError = computed(() => store.mutationError ? extractErrorMessage(store.mutationError) : '')

watch(open, async (isOpen) => {
    if (!isOpen || !props.fuelRecord) return
    store.clearMutationError()
    void store.fetchVehicles()
    const baseline = formFromFuelRecord(props.fuelRecord)
    Object.assign(form, baseline)
    errors.value = {}

    const fresh = await store.find(props.fuelRecord.id)
    if (!open.value || !fresh || fresh.id !== props.fuelRecord.id) return

    const unchanged = (Object.keys(baseline) as (keyof typeof baseline)[]).every(key => form[key] === baseline[key])
    if (unchanged) Object.assign(form, formFromFuelRecord(fresh))
})

async function onSubmit() {
    if (!props.fuelRecord) return

    const next = validateFuelRecordForm(form)
    errors.value = next
    if (store.saving || Object.keys(next).length > 0) return

    const updated = await store.update(props.fuelRecord.id, toFuelRecordUpdateInput(form))
    if (!updated) return

    toast.success('Plein modifié', fuelRecordSummary(updated))
    open.value = false
}
</script>

<template>
    <UiModal
        v-model="open"
        title="Modifier le plein"
        description="Mettez à jour les informations de ce plein."
        size="lg"
        :close-on-overlay="!store.saving"
        :close-on-escape="!store.saving"
    >
        <form id="fuel-record-edit-form" class="flex flex-col gap-5" @submit.prevent="onSubmit">
            <p
                v-if="formError"
                class="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
            >
                {{ formError }}
            </p>

            <FuelRecordForm
                v-model:vehicle-id="form.vehicle_id"
                v-model:fuel-type="form.fuel_type"
                v-model:mileage="form.mileage"
                v-model:quantity="form.quantity"
                v-model:unit-price="form.unit_price"
                v-model:total-price="form.total_price"
                v-model:fuel-date="form.fuel_date"
                v-model:payment-method="form.payment_method"
                v-model:full-tank="form.full_tank"
                v-model:notes="form.notes"
                :vehicles="store.vehicles"
                :options-loading="store.optionsLoading"
                :vehicle-option-label="store.vehicleOptionLabel"
                :lock-vehicle-id="lockVehicle"
                :errors="errors"
                :disabled="store.saving"
            />
        </form>

        <template #footer>
            <UiButton variant="outline" :disabled="store.saving" @click="open = false">
                Annuler
            </UiButton>
            <UiButton type="submit" form="fuel-record-edit-form" :loading="store.saving" :disabled="!fuelRecord">
                Enregistrer
            </UiButton>
        </template>
    </UiModal>
</template>
