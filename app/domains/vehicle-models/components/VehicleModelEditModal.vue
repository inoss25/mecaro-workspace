<script setup lang="ts">
import { useVehicleModelStore } from '../stores/vehicleModelStore'
import type { VehicleModel } from '../types'
import { emptyVehicleModelForm, formFromVehicleModel, toVehicleModelUpdateInput, validateVehicleModelForm } from '../utils/form'
import VehicleModelForm from './VehicleModelForm.vue'

const open = defineModel<boolean>({ default: false })

const props = defineProps<{
    vehicleModel: VehicleModel | null
}>()

const toast = useToast()
const store = useVehicleModelStore()

const form = reactive(emptyVehicleModelForm())
const errors = ref<Record<string, string>>({})
const formError = computed(() => store.mutationError ? extractErrorMessage(store.mutationError) : '')

watch(open, async (isOpen) => {
    if (!isOpen || !props.vehicleModel) return
    store.clearMutationError()
    void store.fetchBrands()
    const baseline = formFromVehicleModel(props.vehicleModel)
    Object.assign(form, baseline)
    errors.value = {}

    const fresh = await store.find(props.vehicleModel.id)
    if (!open.value || !fresh || fresh.id !== props.vehicleModel.id) return

    const unchanged = (Object.keys(baseline) as (keyof typeof baseline)[]).every(key => form[key] === baseline[key])
    if (unchanged) Object.assign(form, formFromVehicleModel(fresh))
})

async function onSubmit() {
    if (!props.vehicleModel) return

    const next = validateVehicleModelForm(form)
    errors.value = next
    if (store.saving || Object.keys(next).length > 0) return

    const updated = await store.update(props.vehicleModel.id, toVehicleModelUpdateInput(form))
    if (!updated) return

    toast.success('Modèle modifié', `${updated.name} a été mis à jour.`)
    open.value = false
}
</script>

<template>
    <UiModal
        v-model="open"
        title="Modifier le modèle"
        description="Mettez à jour la marque, le nom ou le statut."
        size="md"
        :close-on-overlay="!store.saving"
        :close-on-escape="!store.saving"
    >
        <form id="vehicle-model-edit-form" class="flex flex-col gap-5" @submit.prevent="onSubmit">
            <p
                v-if="formError"
                class="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
            >
                {{ formError }}
            </p>

            <VehicleModelForm
                v-model:vehicle-brand-id="form.vehicle_brand_id"
                v-model:name="form.name"
                v-model:model-key="form.key"
                v-model:is-active="form.is_active"
                :brands="store.brands"
                :options-loading="store.optionsLoading"
                :errors="errors"
                :disabled="store.saving"
            />
        </form>

        <template #footer>
            <UiButton variant="outline" :disabled="store.saving" @click="open = false">
                Annuler
            </UiButton>
            <UiButton type="submit" form="vehicle-model-edit-form" :loading="store.saving">
                Enregistrer
            </UiButton>
        </template>
    </UiModal>
</template>
