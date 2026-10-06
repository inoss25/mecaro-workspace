<script setup lang="ts">
import { useMaintenanceRecordStore } from '../stores/maintenanceRecordStore'
import type { MaintenanceRecord } from '../types'
import { emptyMaintenanceRecordForm, formFromMaintenanceRecord, toMaintenanceRecordUpdateInput, validateMaintenanceRecordForm } from '../utils/form'
import { maintenanceRecordLabel } from '../utils/options'
import MaintenanceRecordForm from './MaintenanceRecordForm.vue'

const open = defineModel<boolean>({ default: false })

const props = defineProps<{
    record: MaintenanceRecord | null
    lockVehicle?: boolean
}>()

const toast = useToast()
const store = useMaintenanceRecordStore()

const form = reactive(emptyMaintenanceRecordForm())
const errors = ref<Record<string, string>>({})
const formError = computed(() => store.mutationError ? extractErrorMessage(store.mutationError) : '')

watch(open, async (isOpen) => {
    if (!isOpen || !props.record) return
    store.clearMutationError()
    void store.fetchOptions()
    const baseline = formFromMaintenanceRecord(props.record)
    Object.assign(form, baseline)
    errors.value = {}

    const fresh = await store.find(props.record.id)
    if (!open.value || !fresh || fresh.id !== props.record.id) return

    const unchanged = (Object.keys(baseline) as (keyof typeof baseline)[]).every(key => form[key] === baseline[key])
    if (unchanged) Object.assign(form, formFromMaintenanceRecord(fresh))
})

async function onSubmit() {
    if (!props.record) return

    const next = validateMaintenanceRecordForm(form)
    errors.value = next
    if (store.saving || Object.keys(next).length > 0) return

    const updated = await store.update(props.record.id, toMaintenanceRecordUpdateInput(form))
    if (!updated) return

    toast.success('Intervention modifiée', maintenanceRecordLabel(updated))
    open.value = false
}
</script>

<template>
    <UiModal
        v-model="open"
        title="Modifier l’intervention"
        description="Mettez à jour la date, le kilométrage et le coût."
        size="lg"
        :close-on-overlay="!store.saving"
        :close-on-escape="!store.saving"
    >
        <form id="maintenance-record-edit-form" class="flex flex-col gap-5" @submit.prevent="onSubmit">
            <p
                v-if="formError"
                class="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
            >
                {{ formError }}
            </p>

            <MaintenanceRecordForm
                v-model:vehicle-id="form.vehicle_id"
                v-model:type-id="form.maintenance_type_id"
                v-model:maintenance-date="form.maintenance_date"
                v-model:mileage="form.mileage"
                v-model:cost="form.cost"
                v-model:description="form.description"
                v-model:notes="form.notes"
                :vehicles="store.vehicles"
                :types="store.types"
                :options-loading="store.optionsLoading"
                :vehicle-option-label="store.vehicleOptionLabel"
                :type-option-label="store.typeOptionLabel"
                :lock-vehicle-id="lockVehicle"
                :errors="errors"
                :disabled="store.saving"
            />
        </form>

        <template #footer>
            <UiButton variant="outline" :disabled="store.saving" @click="open = false">
                Annuler
            </UiButton>
            <UiButton type="submit" form="maintenance-record-edit-form" :loading="store.saving" :disabled="!record">
                Enregistrer
            </UiButton>
        </template>
    </UiModal>
</template>
