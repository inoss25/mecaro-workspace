<script setup lang="ts">
import { useAdministratorStore } from '../stores/administratorStore'
import type { Administrator } from '../types'
import { emptyAdministratorForm, formFromAdministrator, toAdministratorUpdateInput, validateAdministratorForm } from '../utils/form'
import AdministratorForm from './AdministratorForm.vue'

const open = defineModel<boolean>({ default: false })

const props = defineProps<{
    administrator: Administrator | null
}>()

const toast = useToast()
const store = useAdministratorStore()

const form = reactive(emptyAdministratorForm())
const errors = ref<Record<string, string>>({})
const imageFile = ref<File | null>(null)
const imageError = ref('')
const formError = computed(() => store.mutationError ? extractErrorMessage(store.mutationError) : '')

watch(open, async (isOpen) => {
    if (!isOpen || !props.administrator) return
    store.clearMutationError()
    const baseline = formFromAdministrator(props.administrator)
    Object.assign(form, baseline)
    errors.value = {}
    imageFile.value = null
    imageError.value = ''

    const fresh = await store.find(props.administrator.id)
    if (!open.value || !fresh || fresh.id !== props.administrator.id || imageFile.value) return

    const unchanged = (Object.keys(baseline) as (keyof typeof baseline)[]).every(key => form[key] === baseline[key])
    if (unchanged) Object.assign(form, formFromAdministrator(fresh))
})

async function onSubmit() {
    if (!props.administrator) return

    const next = validateAdministratorForm(form, 'edit')
    errors.value = next
    if (store.saving || imageError.value || Object.keys(next).length > 0) return

    const updated = await store.update(props.administrator.id, toAdministratorUpdateInput(form), imageFile.value)
    if (!updated) return

    toast.success('Administrateur modifié', `${updated.name} a été mis à jour.`)
    open.value = false
}
</script>

<template>
    <UiModal
        v-model="open"
        title="Modifier l’administrateur"
        description="Mettez à jour l’identité, le statut ou la photo."
        size="lg"
        :close-on-overlay="!store.saving"
        :close-on-escape="!store.saving"
    >
        <form id="administrator-edit-form" @submit.prevent="onSubmit">
            <p
                v-if="formError"
                class="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
            >
                {{ formError }}
            </p>

            <AdministratorForm
                v-model:first-name="form.first_name"
                v-model:last-name="form.last_name"
                v-model:email="form.email"
                v-model:password="form.password"
                v-model:password-confirmation="form.password_confirmation"
                v-model:gender="form.gender"
                v-model:status="form.status"
                v-model:birth-date="form.birth_date"
                v-model:image-file="imageFile"
                v-model:image-error="imageError"
                mode="edit"
                :image-url="administrator?.image_url"
                :errors="errors"
                :disabled="store.saving"
            />
        </form>

        <template #footer>
            <UiButton variant="outline" :disabled="store.saving" @click="open = false">
                Annuler
            </UiButton>
            <UiButton type="submit" form="administrator-edit-form" :loading="store.saving" :disabled="!administrator">
                Enregistrer
            </UiButton>
        </template>
    </UiModal>
</template>
