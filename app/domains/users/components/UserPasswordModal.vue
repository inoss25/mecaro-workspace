<script setup lang="ts">
import { useUserStore } from '../stores/userStore'
import type { User } from '../types'
import { emptyPasswordForm, validatePasswordForm } from '../utils/form'

const open = defineModel<boolean>({ default: false })

const props = defineProps<{
    user: User | null
}>()

const toast = useToast()
const store = useUserStore()

const form = reactive(emptyPasswordForm())
const errors = ref<Record<string, string>>({})
const formError = computed(() => store.mutationError ? extractErrorMessage(store.mutationError) : '')

watch(open, (isOpen) => {
    if (!isOpen) return
    store.clearMutationError()
    Object.assign(form, emptyPasswordForm())
    errors.value = {}
})

async function onSubmit() {
    if (!props.user) return

    const next = validatePasswordForm(form)
    errors.value = next
    if (store.saving || Object.keys(next).length > 0) return

    const updated = await store.changePassword({
        id: props.user.id,
        current_password: form.current_password,
        new_password: form.new_password,
        confirm_new_password: form.confirm_new_password,
    })
    if (!updated) return

    toast.success('Mot de passe modifié', `Le mot de passe de ${updated.name} a été mis à jour.`)
    open.value = false
}
</script>

<template>
    <UiModal
        v-model="open"
        title="Changer le mot de passe"
        :description="user ? `Nouveau mot de passe pour ${user.name}.` : 'Choisissez un utilisateur.'"
        size="md"
        :close-on-overlay="!store.saving"
        :close-on-escape="!store.saving"
    >
        <form id="user-password-form" class="flex flex-col gap-5" @submit.prevent="onSubmit">
            <p
                v-if="formError"
                class="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
            >
                {{ formError }}
            </p>

            <UiInput
                v-model="form.current_password"
                type="password"
                name="current_password"
                autocomplete="current-password"
                label="Mot de passe actuel"
                placeholder="••••••••"
                icon="fa-solid fa-lock"
                :error="errors.current_password"
                :disabled="store.saving"
                data-autofocus
            />

            <UiInput
                v-model="form.new_password"
                type="password"
                name="new_password"
                autocomplete="new-password"
                label="Nouveau mot de passe"
                placeholder="••••••••"
                icon="fa-solid fa-key"
                hint="8 caractères minimum."
                :error="errors.new_password"
                :disabled="store.saving"
            />

            <UiInput
                v-model="form.confirm_new_password"
                type="password"
                name="confirm_new_password"
                autocomplete="new-password"
                label="Confirmation"
                placeholder="••••••••"
                icon="fa-solid fa-key"
                :error="errors.confirm_new_password"
                :disabled="store.saving"
            />
        </form>

        <template #footer>
            <UiButton variant="outline" :disabled="store.saving" @click="open = false">
                Annuler
            </UiButton>
            <UiButton type="submit" form="user-password-form" :loading="store.saving" :disabled="!user">
                Enregistrer
            </UiButton>
        </template>
    </UiModal>
</template>
