<script setup lang="ts">
import { useMaintenanceTypeStore } from '../stores/maintenanceTypeStore'
import type { MaintenanceType } from '../types'
import { emptyMaintenanceTypeForm, formFromMaintenanceType, toMaintenanceTypeUpdateInput, validateMaintenanceTypeForm } from '../utils/form'
import MaintenanceTypeForm from './MaintenanceTypeForm.vue'

const open = defineModel<boolean>({ default: false })

const props = defineProps<{
    maintenanceType: MaintenanceType | null
}>()

const toast = useToast()
const store = useMaintenanceTypeStore()

const form = reactive(emptyMaintenanceTypeForm())
const errors = ref<Record<string, string>>({})
const formError = computed(() => store.mutationError ? extractErrorMessage(store.mutationError) : '')

watch(open, async (isOpen) => {
    if (!isOpen || !props.maintenanceType) return
    store.clearMutationError()
    void store.fetchCategories()
    const baseline = formFromMaintenanceType(props.maintenanceType)
    Object.assign(form, baseline)
    errors.value = {}

    const fresh = await store.find(props.maintenanceType.id)
    if (!open.value || !fresh || fresh.id !== props.maintenanceType.id) return

    const unchanged = (Object.keys(baseline) as (keyof typeof baseline)[]).every(key => form[key] === baseline[key])
    if (unchanged) Object.assign(form, formFromMaintenanceType(fresh))
})

async function onSubmit() {
    if (!props.maintenanceType) return

    const next = validateMaintenanceTypeForm(form)
    errors.value = next
    if (store.saving || Object.keys(next).length > 0) return

    const updated = await store.update(props.maintenanceType.id, toMaintenanceTypeUpdateInput(form))
    if (!updated) return

    toast.success('Type modifié', `${updated.name} a été mis à jour.`)
    open.value = false
}
</script>

<template>
    <UiModal
        v-model="open"
        title="Modifier le type"
        description="Mettez à jour l’opération d’entretien."
        size="md"
        :close-on-overlay="!store.saving"
        :close-on-escape="!store.saving"
    >
        <form id="maintenance-type-edit-form" class="flex flex-col gap-5" @submit.prevent="onSubmit">
            <p
                v-if="formError"
                class="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
            >
                {{ formError }}
            </p>

            <MaintenanceTypeForm
                v-model:category-id="form.maintenance_category_id"
                v-model:name="form.name"
                v-model:description="form.description"
                v-model:icon="form.icon"
                v-model:is-active="form.is_active"
                :categories="store.categories"
                :options-loading="store.optionsLoading"
                :errors="errors"
                :disabled="store.saving"
            />
        </form>

        <template #footer>
            <UiButton variant="outline" :disabled="store.saving" @click="open = false">
                Annuler
            </UiButton>
            <UiButton type="submit" form="maintenance-type-edit-form" :loading="store.saving" :disabled="!maintenanceType">
                Enregistrer
            </UiButton>
        </template>
    </UiModal>
</template>
