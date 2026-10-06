<script setup lang="ts">
import { useMaintenanceRecordStore } from '../stores/maintenanceRecordStore'
import { emptyMaintenanceRecordForm, toMaintenanceRecordCreateInput, validateMaintenanceRecordForm } from '../utils/form'
import { maintenanceRecordLabel } from '../utils/options'
import MaintenanceRecordForm from './MaintenanceRecordForm.vue'

const open = defineModel<boolean>({ default: false })

const props = withDefaults(defineProps<{
    defaultVehicleId?: string
    lockVehicle?: boolean
}>(), {
    defaultVehicleId: '',
    lockVehicle: false,
})

const toast = useToast()
const store = useMaintenanceRecordStore()

const form = reactive(emptyMaintenanceRecordForm(props.defaultVehicleId))
const errors = ref<Record<string, string>>({})
const formError = computed(() => store.mutationError ? extractErrorMessage(store.mutationError) : '')

watch(open, (isOpen) => {
    if (!isOpen) return
    store.clearMutationError()
    Object.assign(form, emptyMaintenanceRecordForm(props.defaultVehicleId))
    errors.value = {}
    void store.fetchOptions()
})

watch(() => props.defaultVehicleId, (value) => {
    if (!open.value) return
    form.vehicle_id = value
})

async function onSubmit() {
    const next = validateMaintenanceRecordForm(form)
    errors.value = next
    if (store.saving || Object.keys(next).length > 0) return

    const created = await store.create(toMaintenanceRecordCreateInput(form))
    if (!created) return

    toast.success('Intervention enregistrée', maintenanceRecordLabel(created))
    open.value = false
}
</script>

<template>
    <UiModal
        v-model="open"
        title="Nouvelle intervention"
        description="Enregistrez un entretien pour un véhicule."
        size="lg"
        :close-on-overlay="!store.saving"
        :close-on-escape="!store.saving"
    >
        <form id="maintenance-record-create-form" class="flex flex-col gap-5" @submit.prevent="onSubmit">
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
            <UiButton type="submit" form="maintenance-record-create-form" :loading="store.saving">
                Enregistrer
            </UiButton>
        </template>
    </UiModal>
</template>
