<script setup lang="ts">
import { useMaintenanceSettingStore } from '../stores/maintenanceSettingStore'
import type { MaintenanceSetting } from '../types'
import { emptyMaintenanceSettingForm, formFromMaintenanceSetting, toMaintenanceSettingUpdateInput, validateMaintenanceSettingForm } from '../utils/form'
import { formatInterval } from '../utils/options'
import MaintenanceSettingForm from './MaintenanceSettingForm.vue'

const open = defineModel<boolean>({ default: false })
const props = defineProps<{
    setting: MaintenanceSetting | null
    lockVehicle?: boolean
}>()

const toast = useToast()
const store = useMaintenanceSettingStore()
const form = reactive(emptyMaintenanceSettingForm())
const errors = ref<Record<string, string>>({})
const formError = computed(() => store.mutationError ? extractErrorMessage(store.mutationError) : '')

watch(open, async (isOpen) => {
    if (!isOpen || !props.setting) return
    store.clearMutationError()
    void store.fetchOptions()
    const baseline = formFromMaintenanceSetting(props.setting)
    Object.assign(form, baseline)
    errors.value = {}
    const fresh = await store.find(props.setting.id)
    if (!open.value || !fresh || fresh.id !== props.setting.id) return
    const unchanged = (Object.keys(baseline) as (keyof typeof baseline)[]).every(key => form[key] === baseline[key])
    if (unchanged) Object.assign(form, formFromMaintenanceSetting(fresh))
})

async function onSubmit() {
    if (!props.setting) return
    const next = validateMaintenanceSettingForm(form)
    errors.value = next
    if (store.saving || Object.keys(next).length > 0) return
    const updated = await store.update(props.setting.id, toMaintenanceSettingUpdateInput(form))
    if (!updated) return
    toast.success('Intervalle modifié', `${updated.maintenance_type.name} — ${formatInterval(updated.interval_km)}`)
    open.value = false
}
</script>

<template>
    <UiModal v-model="open" title="Modifier l’intervalle" description="Mettez à jour la périodicité de cet entretien." size="md" :close-on-overlay="!store.saving" :close-on-escape="!store.saving">
        <form id="maintenance-setting-edit-form" class="flex flex-col gap-5" @submit.prevent="onSubmit">
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
            <UiButton type="submit" form="maintenance-setting-edit-form" :loading="store.saving" :disabled="!setting">Enregistrer</UiButton>
        </template>
    </UiModal>
</template>
