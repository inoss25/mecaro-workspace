<script setup lang="ts">
import { useUserStore } from '../stores/userStore'
import type { User } from '../types'
import { emptyUserForm, formFromUser, toUserUpdateInput, validateUserForm } from '../utils/form'
import UserForm from './UserForm.vue'

const open = defineModel<boolean>({ default: false })

const props = defineProps<{
    user: User | null
}>()

const toast = useToast()
const store = useUserStore()

const form = reactive(emptyUserForm())
const errors = ref<Record<string, string>>({})
const imageFile = ref<File | null>(null)
const imageError = ref('')
const formError = computed(() => store.mutationError ? extractErrorMessage(store.mutationError) : '')

watch(open, async (isOpen) => {
    if (!isOpen || !props.user) return
    store.clearMutationError()
    const baseline = formFromUser(props.user)
    Object.assign(form, baseline)
    errors.value = {}
    imageFile.value = null
    imageError.value = ''

    const fresh = await store.find(props.user.id)
    if (!open.value || !fresh || fresh.id !== props.user.id || imageFile.value) return

    const unchanged = (Object.keys(baseline) as (keyof typeof baseline)[]).every(key => form[key] === baseline[key])
    if (unchanged) Object.assign(form, formFromUser(fresh))
})

async function onSubmit() {
    if (!props.user) return

    const next = validateUserForm(form, 'edit')
    errors.value = next
    if (store.saving || imageError.value || Object.keys(next).length > 0) return

    const updated = await store.update(props.user.id, toUserUpdateInput(form), imageFile.value)
    if (!updated) return

    toast.success('Utilisateur modifié', `${updated.name} a été mis à jour.`)
    open.value = false
}
</script>

<template>
    <UiModal
        v-model="open"
        title="Modifier l’utilisateur"
        description="Mettez à jour l’identité, les coordonnées, le statut ou la photo."
        size="lg"
        :close-on-overlay="!store.saving"
        :close-on-escape="!store.saving"
    >
        <form id="user-edit-form" @submit.prevent="onSubmit">
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
                mode="edit"
                :image-url="user?.image_url"
                :errors="errors"
                :disabled="store.saving"
            />
        </form>

        <template #footer>
            <UiButton variant="outline" :disabled="store.saving" @click="open = false">
                Annuler
            </UiButton>
            <UiButton type="submit" form="user-edit-form" :loading="store.saving" :disabled="!user">
                Enregistrer
            </UiButton>
        </template>
    </UiModal>
</template>
