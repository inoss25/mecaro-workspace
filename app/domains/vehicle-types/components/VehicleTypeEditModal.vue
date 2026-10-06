<script setup lang="ts">
import { useVehicleTypeStore } from '../stores/vehicleTypeStore'
import type { VehicleType } from '../types'
import { emptyVehicleTypeForm, formFromVehicleType, toVehicleTypeInput, validateVehicleTypeForm } from '../utils/form'
import VehicleTypeForm from './VehicleTypeForm.vue'

const open = defineModel<boolean>({ default: false })

const props = defineProps<{
    vehicleType: VehicleType | null
}>()

const toast = useToast()
const store = useVehicleTypeStore()

const form = reactive(emptyVehicleTypeForm())
const errors = ref<Record<string, string>>({})
const formError = computed(() => store.mutationError ? extractErrorMessage(store.mutationError) : '')

watch(open, (isOpen) => {
    if (!isOpen || !props.vehicleType) return
    store.clearMutationError()
    Object.assign(form, formFromVehicleType(props.vehicleType))
    errors.value = {}
})

async function onSubmit() {
    if (!props.vehicleType) return

    const next = validateVehicleTypeForm(form)
    errors.value = next
    if (store.saving || Object.keys(next).length > 0) return

    const updated = await store.update(props.vehicleType.id, toVehicleTypeInput(form))
    if (!updated) return

    toast.success('Type modifié', `${updated.name} a été mis à jour.`)
    open.value = false
}
</script>

<template>
    <UiModal v-model="open" title="Modifier le type" description="Mettez à jour le nom, la clé, l’icône ou le statut."
        size="md" :close-on-overlay="!store.saving" :close-on-escape="!store.saving">
        <form id="vehicle-type-edit-form" class="flex flex-col gap-5" @submit.prevent="onSubmit">
            <p v-if="formError" class="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                {{ formError }}
            </p>

            <VehicleTypeForm v-model:name="form.name" v-model:type-key="form.key" v-model:icon="form.icon"
                v-model:is-active="form.is_active" :errors="errors" :disabled="store.saving" />
        </form>

        <template #footer>
            <UiButton variant="outline" :disabled="store.saving" @click="open = false">
                Annuler
            </UiButton>
            <UiButton type="submit" form="vehicle-type-edit-form" :loading="store.saving" :disabled="!vehicleType">
                Enregistrer
            </UiButton>
        </template>
    </UiModal>
</template>
