<script setup lang="ts">
import { useVehicleModelStore } from '../stores/vehicleModelStore'
import { emptyVehicleModelForm, toVehicleModelCreateInput, validateVehicleModelForm } from '../utils/form'
import VehicleModelForm from './VehicleModelForm.vue'

const open = defineModel<boolean>({ default: false })

const toast = useToast()
const store = useVehicleModelStore()

const form = reactive(emptyVehicleModelForm())
const errors = ref<Record<string, string>>({})
const formError = computed(() => store.mutationError ? extractErrorMessage(store.mutationError) : '')

watch(open, (isOpen) => {
    if (!isOpen) return
    store.clearMutationError()
    Object.assign(form, emptyVehicleModelForm())
    errors.value = {}
    void store.fetchBrands()
})

async function onSubmit() {
    const next = validateVehicleModelForm(form)
    errors.value = next
    if (store.saving || Object.keys(next).length > 0) return

    const created = await store.create(toVehicleModelCreateInput(form))
    if (!created) return

    toast.success('Modèle créé', `${created.name} a été ajouté.`)
    open.value = false
}
</script>

<template>
    <UiModal
        v-model="open"
        title="Nouveau modèle"
        description="Associez un modèle à une marque existante."
        size="md"
        :close-on-overlay="!store.saving"
        :close-on-escape="!store.saving"
    >
        <form id="vehicle-model-create-form" class="flex flex-col gap-5" @submit.prevent="onSubmit">
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
                auto-key
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
            <UiButton type="submit" form="vehicle-model-create-form" :loading="store.saving">
                Créer le modèle
            </UiButton>
        </template>
    </UiModal>
</template>
