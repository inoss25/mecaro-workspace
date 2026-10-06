<script setup lang="ts">
import { useVehicleBrandStore } from '../stores/vehicleBrandStore'
import type { VehicleBrand } from '../types'
import { emptyVehicleBrandForm, formFromVehicleBrand, toVehicleBrandUpdateInput, validateVehicleBrandForm } from '../utils/form'
import { vehicleBrandLogoUrl } from '../utils/options'
import VehicleBrandForm from './VehicleBrandForm.vue'

const open = defineModel<boolean>({ default: false })

const props = defineProps<{
    vehicleBrand: VehicleBrand | null
}>()

const toast = useToast()
const store = useVehicleBrandStore()
const config = useRuntimeConfig()
const apiBaseUrl = computed(() => config.public.apiBaseUrl as string)

const form = reactive(emptyVehicleBrandForm())
const errors = ref<Record<string, string>>({})
const logoFile = ref<File | null>(null)
const logoError = ref('')
const formError = computed(() => store.mutationError ? extractErrorMessage(store.mutationError) : '')

const logoSrc = computed(() => {
    if (!props.vehicleBrand) return ''
    return vehicleBrandLogoUrl(props.vehicleBrand, apiBaseUrl.value)
})

watch(open, async (isOpen) => {
    if (!isOpen || !props.vehicleBrand) return
    store.clearMutationError()
    const baseline = formFromVehicleBrand(props.vehicleBrand)
    Object.assign(form, baseline)
    errors.value = {}
    logoFile.value = null
    logoError.value = ''

    const fresh = await store.find(props.vehicleBrand.id)
    if (!open.value || !fresh || fresh.id !== props.vehicleBrand.id || logoFile.value) return

    const unchanged = (Object.keys(baseline) as (keyof typeof baseline)[]).every(key => form[key] === baseline[key])
    if (unchanged) Object.assign(form, formFromVehicleBrand(fresh))
})

async function onSubmit() {
    if (!props.vehicleBrand) return

    const next = validateVehicleBrandForm(form)
    errors.value = next
    if (store.saving || logoError.value || Object.keys(next).length > 0) return

    const updated = await store.update(props.vehicleBrand.id, toVehicleBrandUpdateInput(form), logoFile.value)
    if (!updated) return

    toast.success('Marque modifiée', `${updated.name} a été mise à jour.`)
    open.value = false
}
</script>

<template>
    <UiModal
        v-model="open"
        title="Modifier la marque"
        description="Mettez à jour le nom, le logo ou le statut."
        size="md"
        :close-on-overlay="!store.saving"
        :close-on-escape="!store.saving"
    >
        <form id="vehicle-brand-edit-form" class="flex flex-col gap-5" @submit.prevent="onSubmit">
            <p
                v-if="formError"
                class="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
            >
                {{ formError }}
            </p>

            <VehicleBrandForm
                v-model:name="form.name"
                v-model:brand-key="form.key"
                v-model:is-active="form.is_active"
                v-model:logo-file="logoFile"
                v-model:logo-error="logoError"
                :logo-src="logoSrc"
                :errors="errors"
                :disabled="store.saving"
            />
        </form>

        <template #footer>
            <UiButton variant="outline" :disabled="store.saving" @click="open = false">
                Annuler
            </UiButton>
            <UiButton type="submit" form="vehicle-brand-edit-form" :loading="store.saving">
                Enregistrer
            </UiButton>
        </template>
    </UiModal>
</template>
