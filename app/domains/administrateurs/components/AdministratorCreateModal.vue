<script setup lang="ts">
import { useAdministratorStore } from '../stores/administratorStore'
import { emptyAdministratorForm, toAdministratorCreateInput, validateAdministratorForm } from '../utils/form'
import AdministratorForm from './AdministratorForm.vue'

const open = defineModel<boolean>({ default: false })

const toast = useToast()
const store = useAdministratorStore()

const form = reactive(emptyAdministratorForm())
const errors = ref<Record<string, string>>({})
const imageFile = ref<File | null>(null)
const imageError = ref('')
const formError = computed(() => store.mutationError ? extractErrorMessage(store.mutationError) : '')

watch(open, (isOpen) => {
    if (!isOpen) return
    store.clearMutationError()
    Object.assign(form, emptyAdministratorForm())
    errors.value = {}
    imageFile.value = null
    imageError.value = ''
})

async function onSubmit() {
    const next = validateAdministratorForm(form, 'create')
    errors.value = next
    if (store.saving || imageError.value || Object.keys(next).length > 0) return

    const created = await store.create(toAdministratorCreateInput(form), imageFile.value)
    if (!created) return

    toast.success('Administrateur créé', `${created.name} a été ajouté.`)
    open.value = false
}
</script>

<template>
    <UiModal
        v-model="open"
        title="Nouvel administrateur"
        description="Créez un compte avec un accès à l’espace d’administration."
        size="lg"
        :close-on-overlay="!store.saving"
        :close-on-escape="!store.saving"
    >
        <form id="administrator-create-form" @submit.prevent="onSubmit">
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
                mode="create"
                :errors="errors"
                :disabled="store.saving"
            />
        </form>

        <template #footer>
            <UiButton variant="outline" :disabled="store.saving" @click="open = false">
                Annuler
            </UiButton>
            <UiButton type="submit" form="administrator-create-form" :loading="store.saving">
                Créer l’administrateur
            </UiButton>
        </template>
    </UiModal>
</template>
