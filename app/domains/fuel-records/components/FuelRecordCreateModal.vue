<script setup lang="ts">
import { useFuelRecordStore } from '../stores/fuelRecordStore'
import { emptyFuelRecordForm, toFuelRecordCreateInput, validateFuelRecordForm } from '../utils/form'
import { fuelRecordSummary } from '../utils/options'
import FuelRecordForm from './FuelRecordForm.vue'

const open = defineModel<boolean>({ default: false })

const props = withDefaults(defineProps<{
    defaultVehicleId?: string
    lockVehicle?: boolean
}>(), {
    defaultVehicleId: '',
    lockVehicle: false,
})

const toast = useToast()
const store = useFuelRecordStore()

const form = reactive(emptyFuelRecordForm(props.defaultVehicleId))
const errors = ref<Record<string, string>>({})
const formError = computed(() => store.mutationError ? extractErrorMessage(store.mutationError) : '')

watch(open, (isOpen) => {
    if (!isOpen) return
    store.clearMutationError()
    Object.assign(form, emptyFuelRecordForm(props.defaultVehicleId))
    errors.value = {}
    void store.fetchVehicles()
})

watch(() => props.defaultVehicleId, (value) => {
    if (!open.value) return
    form.vehicle_id = value
})

async function onSubmit() {
    const next = validateFuelRecordForm(form)
    errors.value = next
    if (store.saving || Object.keys(next).length > 0) return

    const created = await store.create(toFuelRecordCreateInput(form))
    if (!created) return

    toast.success('Plein enregistré', fuelRecordSummary(created))
    open.value = false
}
</script>

<template>
    <UiModal
        v-model="open"
        title="Nouveau plein"
        description="Enregistrez un plein de carburant pour un véhicule."
        size="lg"
        :close-on-overlay="!store.saving"
        :close-on-escape="!store.saving"
    >
        <form id="fuel-record-create-form" class="flex flex-col gap-5" @submit.prevent="onSubmit">
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
            <UiButton type="submit" form="fuel-record-create-form" :loading="store.saving">
                Enregistrer le plein
            </UiButton>
        </template>
    </UiModal>
</template>
