<script setup lang="ts">
import { useUserStore } from '../stores/userStore'
import { emptyUserForm, toUserCreateInput, validateUserForm } from '../utils/form'
import UserForm from './UserForm.vue'

const open = defineModel<boolean>({ default: false })

const toast = useToast()
const store = useUserStore()

const form = reactive(emptyUserForm())
const errors = ref<Record<string, string>>({})
const imageFile = ref<File | null>(null)
const imageError = ref('')
const formError = computed(() => store.mutationError ? extractErrorMessage(store.mutationError) : '')

watch(open, (isOpen) => {
    if (!isOpen) return
    store.clearMutationError()
    Object.assign(form, emptyUserForm())
    errors.value = {}
    imageFile.value = null
    imageError.value = ''
})

async function onSubmit() {
    const next = validateUserForm(form, 'create')
    errors.value = next
    if (store.saving || imageError.value || Object.keys(next).length > 0) return

    const created = await store.create(toUserCreateInput(form), imageFile.value)
    if (!created) return

    toast.success('Utilisateur créé', `${created.name} a été ajouté.`)
    open.value = false
}
</script>

<template>
    <UiModal
        v-model="open"
        title="Nouvel utilisateur"
        description="Créez un compte avec ses coordonnées et son accès."
        size="lg"
        :close-on-overlay="!store.saving"
        :close-on-escape="!store.saving"
    >
        <form id="user-create-form" @submit.prevent="onSubmit">
            <p
                v-if="formError"
                class="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
            >
                {{ formError }}
            </p>

            <UserForm
                v-model:first-name="form.first_name"
                v-model:last-name="form.last_name"
                v-model:email="form.email"
                v-model:phone-number="form.phone_number"
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
            <UiButton type="submit" form="user-create-form" :loading="store.saving">
                Créer l’utilisateur
            </UiButton>
        </template>
    </UiModal>
</template>
