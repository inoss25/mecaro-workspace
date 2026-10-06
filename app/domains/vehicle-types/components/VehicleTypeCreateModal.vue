<script setup lang="ts">
import { useVehicleTypeStore } from '../stores/vehicleTypeStore'
import { emptyVehicleTypeForm, toVehicleTypeInput, validateVehicleTypeForm } from '../utils/form'
import VehicleTypeForm from './VehicleTypeForm.vue'

const open = defineModel<boolean>({ default: false })

const toast = useToast()
const store = useVehicleTypeStore()

const form = reactive(emptyVehicleTypeForm())
const errors = ref<Record<string, string>>({})
const formError = computed(() => store.mutationError ? extractErrorMessage(store.mutationError) : '')

watch(open, (isOpen) => {
    if (!isOpen) return
    store.clearMutationError()
    Object.assign(form, emptyVehicleTypeForm())
    errors.value = {}
})

async function onSubmit() {
    const next = validateVehicleTypeForm(form)
    errors.value = next
    if (store.saving || Object.keys(next).length > 0) return

    const created = await store.create(toVehicleTypeInput(form))
    if (!created) return

    toast.success('Type créé', `${created.name} a été ajouté.`)
    open.value = false
}
</script>

<template>
    <UiModal
        v-model="open"
        title="Nouveau type"
        description="Ajoutez une catégorie utilisée pour classer les engins."
        size="md"
        :close-on-overlay="!store.saving"
        :close-on-escape="!store.saving"
    >
        <form id="vehicle-type-create-form" class="flex flex-col gap-5" @submit.prevent="onSubmit">
            <p
                v-if="formError"
                class="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
            >
                {{ formError }}
            </p>

            <VehicleTypeForm
                v-model:name="form.name"
                v-model:type-key="form.key"
                v-model:icon="form.icon"
                v-model:is-active="form.is_active"
                auto-key
                :errors="errors"
                :disabled="store.saving"
            />
        </form>

        <template #footer>
            <UiButton variant="outline" :disabled="store.saving" @click="open = false">
                Annuler
            </UiButton>
            <UiButton type="submit" form="vehicle-type-create-form" :loading="store.saving">
                Créer le type
            </UiButton>
        </template>
    </UiModal>
</template>
