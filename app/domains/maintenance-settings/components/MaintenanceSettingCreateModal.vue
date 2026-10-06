<script setup lang="ts">
import { useMaintenanceSettingStore } from '../stores/maintenanceSettingStore'
import { emptyMaintenanceSettingForm, toMaintenanceSettingCreateInput, validateMaintenanceSettingForm } from '../utils/form'
import { formatInterval } from '../utils/options'
import MaintenanceSettingForm from './MaintenanceSettingForm.vue'

const open = defineModel<boolean>({ default: false })
const props = withDefaults(defineProps<{
    defaultVehicleId?: string
    lockVehicle?: boolean
}>(), {
    defaultVehicleId: '',
    lockVehicle: false,
})

const toast = useToast()
const store = useMaintenanceSettingStore()
const form = reactive(emptyMaintenanceSettingForm(props.defaultVehicleId))
const errors = ref<Record<string, string>>({})
const formError = computed(() => store.mutationError ? extractErrorMessage(store.mutationError) : '')

watch(open, (isOpen) => {
    if (!isOpen) return
    store.clearMutationError()
    Object.assign(form, emptyMaintenanceSettingForm(props.defaultVehicleId))
    errors.value = {}
    void store.fetchOptions()
})

async function onSubmit() {
    const next = validateMaintenanceSettingForm(form)
    errors.value = next
    if (store.saving || Object.keys(next).length > 0) return
    const created = await store.create(toMaintenanceSettingCreateInput(form))
    if (!created) return
    toast.success('Intervalle créé', `${created.maintenance_type.name} — ${formatInterval(created.interval_km)}`)
    open.value = false
}
</script>

<template>
    <UiModal v-model="open" title="Nouvel intervalle" description="Définissez la périodicité d’un entretien pour un véhicule." size="md" :close-on-overlay="!store.saving" :close-on-escape="!store.saving">
        <form id="maintenance-setting-create-form" class="flex flex-col gap-5" @submit.prevent="onSubmit">
            <p v-if="formError" class="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{{ formError }}</p>
            <MaintenanceSettingForm
                v-model:vehicle-id="form.vehicle_id"
                v-model:type-id="form.maintenance_type_id"
                v-model:interval-km="form.interval_km"
                v-model:is-active="form.is_active"
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
            <UiButton variant="outline" :disabled="store.saving" @click="open = false">Annuler</UiButton>
            <UiButton type="submit" form="maintenance-setting-create-form" :loading="store.saving">Enregistrer</UiButton>
        </template>
    </UiModal>
</template>
