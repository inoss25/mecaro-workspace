<script setup lang="ts">
import { useVehicleBrandStore } from '../stores/vehicleBrandStore'
import { emptyVehicleBrandForm, toVehicleBrandCreateInput, validateVehicleBrandForm } from '../utils/form'
import VehicleBrandForm from './VehicleBrandForm.vue'

const open = defineModel<boolean>({ default: false })

const toast = useToast()
const store = useVehicleBrandStore()

const form = reactive(emptyVehicleBrandForm())
const errors = ref<Record<string, string>>({})
const logoFile = ref<File | null>(null)
const logoError = ref('')
const formError = computed(() => store.mutationError ? extractErrorMessage(store.mutationError) : '')

watch(open, (isOpen) => {
    if (!isOpen) return
    store.clearMutationError()
    Object.assign(form, emptyVehicleBrandForm())
    errors.value = {}
    logoFile.value = null
    logoError.value = ''
})

async function onSubmit() {
    const next = validateVehicleBrandForm(form)
    errors.value = next
    if (store.saving || logoError.value || Object.keys(next).length > 0) return

    const created = await store.create(toVehicleBrandCreateInput(form), logoFile.value)
    if (!created) return

    toast.success('Marque créée', `${created.name} a été ajoutée.`)
    open.value = false
}
</script>

<template>
    <UiModal
        v-model="open"
        title="Nouvelle marque"
        description="Ajoutez une marque de véhicule avec son logo."
        size="md"
        :close-on-overlay="!store.saving"
        :close-on-escape="!store.saving"
    >
        <form id="vehicle-brand-create-form" class="flex flex-col gap-5" @submit.prevent="onSubmit">
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
                auto-key
                :errors="errors"
                :disabled="store.saving"
            />
        </form>

        <template #footer>
            <UiButton variant="outline" :disabled="store.saving" @click="open = false">
                Annuler
            </UiButton>
            <UiButton type="submit" form="vehicle-brand-create-form" :loading="store.saving">
                Créer la marque
            </UiButton>
        </template>
    </UiModal>
</template>
