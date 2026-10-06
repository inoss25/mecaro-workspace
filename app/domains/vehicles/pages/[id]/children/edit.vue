<script setup lang="ts">
import VehicleForm from '../../../components/VehicleForm.vue'
import { useVehicleDetail } from '../../../composables/useVehicleDetail'
import { useVehicleStore } from '../../../stores/vehicleStore'
import { emptyVehicleForm, formFromVehicle, toVehicleUpdateInput, validateVehicleForm } from '../../../utils/form'
import { vehicleImageSrc, vehicleLabel } from '../../../utils/options'

const localePath = useLocalePath()
const toast = useToast()
const config = useRuntimeConfig()
const store = useVehicleStore()
const { vehicle, refresh } = useVehicleDetail()

const form = reactive(emptyVehicleForm())
const errors = ref<Record<string, string>>({})
const imageFile = ref<File | null>(null)
const imageError = ref('')
const formReady = ref(false)
const formError = computed(() => store.mutationError ? extractErrorMessage(store.mutationError) : '')

const imageUrl = computed(() => {
    if (!vehicle.value?.image_path) return ''
    return vehicleImageSrc(vehicle.value.image_path, config.public.apiBaseUrl as string)
})

watch(vehicle, async (current) => {
    if (!current) return
    store.clearMutationError()
    Object.assign(form, formFromVehicle(current))
    errors.value = {}
    imageFile.value = null
    imageError.value = ''
    formReady.value = false
    void store.fetchOptions()
    if (form.brand_source === 'catalog' && form.vehicle_brand_id) {
        await store.fetchModelsForBrand(form.vehicle_brand_id)
    }
    formReady.value = true
}, { immediate: true })

async function onSubmit() {
    if (!vehicle.value) return

    const next = validateVehicleForm(form, 'edit', imageFile.value)
    errors.value = next
    if (store.saving || imageError.value || Object.keys(next).length > 0) return

    const updated = await store.update(vehicle.value.id, toVehicleUpdateInput(form), imageFile.value)
    if (!updated) return

    toast.success('Véhicule modifié', `${vehicleLabel(updated)} a été mis à jour.`)
    await refresh()
    await navigateTo(localePath(`/vehicles/${updated.id}`))
}

const cancelTo = computed(() => localePath(`/vehicles/${vehicle.value?.id ?? ''}`))
</script>

<template>
    <section class="rounded-[28px] bg-surface p-6 shadow-sm sm:p-8">
        <div class="mb-6">
            <h3 class="text-lg font-semibold text-neutral-950">
                Modifier le véhicule
            </h3>
            <p class="mt-1 text-sm text-neutral-500">
                Mettez à jour l’identité, le type, le carburant ou la photo.
            </p>
        </div>

        <form v-if="vehicle && formReady" @submit.prevent="onSubmit">
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
                v-model:manufacture-year="form.manufacture_year"
                v-model:initial-mileage="form.initial_mileage"
                v-model:current-mileage="form.current_mileage"
                v-model:is-active="form.is_active"
                v-model:image-file="imageFile"
                v-model:image-error="imageError"
                mode="edit"
                :owner-name="vehicle.user.name"
                :image-url="imageUrl"
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
                <UiButton variant="outline" :to="cancelTo" :disabled="store.saving">
                    Annuler
                </UiButton>
                <UiButton type="submit" :loading="store.saving">
                    Enregistrer
                </UiButton>
            </div>
        </form>

        <p v-else class="text-sm text-neutral-500">
            Préparation du formulaire…
        </p>
    </section>
</template>
