<script setup lang="ts">
import VehicleCreatePreview from '../components/VehicleCreatePreview.vue'
import VehicleForm from '../components/VehicleForm.vue'
import { useVehicleStore } from '../stores/vehicleStore'
import { emptyVehicleForm, toVehicleCreateInput, validateVehicleForm } from '../utils/form'
import { vehicleLabel } from '../utils/options'

const appConfig = useAppConfig()
const localePath = useLocalePath()
const toast = useToast()
const store = useVehicleStore()

useHead({
    title: `Nouveau véhicule — ${appConfig.title}`,
})

const form = reactive(emptyVehicleForm())
const errors = ref<Record<string, string>>({})
const imageFile = ref<File | null>(null)
const imageError = ref('')
const formError = computed(() => store.mutationError ? extractErrorMessage(store.mutationError) : '')

onMounted(() => {
    store.clearMutationError()
    Object.assign(form, emptyVehicleForm())
    void store.fetchOptions()
})

async function onSubmit() {
    const next = validateVehicleForm(form, 'create', imageFile.value)
    errors.value = next
    if (store.saving || imageError.value || Object.keys(next).length > 0) return

    const created = await store.create(toVehicleCreateInput(form, imageFile.value))
    if (!created) return

    toast.success('Véhicule créé', `${vehicleLabel(created)} a été ajouté.`)
    await navigateTo(localePath('/vehicles'))
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <LayoutsSectionPage
            title="Nouveau véhicule"
            description="Enregistrez un véhicule avec son propriétaire, son type et son identité."
        >
            <template #actions>
                <UiButton
                    variant="outline"
                    size="sm"
                    :to="localePath('/vehicles')"
                    :disabled="store.saving"
                >
                    Retour à la liste
                </UiButton>
            </template>
        </LayoutsSectionPage>

        <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] xl:items-start">
            <form
                id="vehicle-create-page-form"
                class="min-w-0 rounded-[28px] bg-surface p-6 shadow-sm sm:p-8"
                @submit.prevent="onSubmit"
            >
                <p
                    v-if="formError"
                    class="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
                    role="alert"
                >
                    {{ formError }}
                </p>

                <VehicleForm
                    v-model:user-id="form.user_id"
                    v-model:vehicle-type-id="form.vehicle_type_id"
                    v-model:brand-source="form.brand_source"
                    v-model:vehicle-brand-id="form.vehicle_brand_id"
                    v-model:vehicle-model-id="form.vehicle_model_id"
                    v-model:custom-brand-name="form.custom_brand_name"
                    v-model:custom-model-name="form.custom_model_name"
                    v-model:name="form.name"
                    v-model:registration-number="form.registration_number"
                    v-model:fuel-type="form.fuel_type"
                    v-model:color="form.color"
                    v-model:engine-capacity="form.engine_capacity"
                    v-model:transmission="form.transmission"
                    v-model:purchase-date="form.purchase_date"
                    v-model:initial-mileage="form.initial_mileage"
                    v-model:current-mileage="form.current_mileage"
                    v-model:is-active="form.is_active"
                    v-model:image-file="imageFile"
                    v-model:image-error="imageError"
                    mode="create"
                    :users="store.users"
                    :vehicle-types="store.vehicleTypes"
                    :vehicle-brands="store.vehicleBrands"
                    :vehicle-models="store.vehicleModels"
                    :options-loading="store.optionsLoading"
                    :models-loading="store.modelsLoading"
                    :errors="errors"
                    :disabled="store.saving"
                />

                <div class="mt-8 flex flex-wrap justify-end gap-3 border-t border-neutral-100 pt-6">
                    <UiButton
                        variant="outline"
                        :to="localePath('/vehicles')"
                        :disabled="store.saving"
                    >
                        Annuler
                    </UiButton>
                    <UiButton type="submit" :loading="store.saving">
                        Créer le véhicule
                    </UiButton>
                </div>
            </form>

            <aside class="min-w-0 xl:sticky xl:top-4 xl:self-start">
                <VehicleCreatePreview
                    :form="form"
                    :image-file="imageFile"
                    :users="store.users"
                    :vehicle-types="store.vehicleTypes"
                    :vehicle-brands="store.vehicleBrands"
                    :vehicle-models="store.vehicleModels"
                />
            </aside>
        </div>
    </div>
</template>
