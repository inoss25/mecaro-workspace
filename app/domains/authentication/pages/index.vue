<script setup lang="ts">
const appConfig = useAppConfig()

useHead({
    title: `Connexion — ${appConfig.title}`,
})

definePageMeta({
    layout: 'auth',
})

const { signIn, status } = useAuth()
const { error: showError } = useAlert()
const deviceInfo = useDevice()

const email = ref('')
const password = ref('')
const loading = ref(false)

const knownMessages: Record<string, string> = {
    'User not found': 'Aucun compte ne correspond à cette adresse e-mail.',
    'Invalid password': 'Le mot de passe est incorrect.',
    'The selected email is invalid.': 'Aucun compte ne correspond à cette adresse e-mail.',
    'The email field is required.': 'L’adresse e-mail est obligatoire.',
    'The password field is required.': 'Le mot de passe est obligatoire.',
}

function deviceLabel() {
    if (deviceInfo.isIos) return 'ios'
    if (deviceInfo.isAndroid) return 'android'
    if (deviceInfo.isMacOS) return 'macos'
    if (deviceInfo.isWindows) return 'windows'
    if (deviceInfo.isMobile) return 'mobile'
    return 'web'
}

function readPayload(error: unknown) {
    if (!error || typeof error !== 'object') return null
    const record = error as { data?: unknown, response?: { _data?: unknown } }
    const payload = record.data ?? record.response?._data
    if (!payload || typeof payload !== 'object') return null
    return payload as Record<string, unknown>
}

function firstValidationMessage(errors: unknown) {
    if (!errors || typeof errors !== 'object') return null
    for (const value of Object.values(errors as Record<string, unknown>)) {
        if (typeof value === 'string' && value.trim()) return value
        if (Array.isArray(value) && typeof value[0] === 'string' && value[0].trim()) return value[0]
    }
    return null
}

function authErrorMessage(error: unknown) {
    const payload = readPayload(error)
    const raw = typeof payload?.message === 'string'
        ? payload.message
        : firstValidationMessage(payload?.errors)
    if (!raw) return 'Impossible de se connecter. Vérifiez vos identifiants.'
    return knownMessages[raw] ?? raw
}

async function onSubmit() {
    if (loading.value) return
    loading.value = true
    try {
        const response = await signIn({
            email: email.value,
            password: password.value,
            device: deviceLabel(),
        }, { redirect: false })

        if (!response || status.value !== 'authenticated') {
            await showError('Connexion impossible', 'Impossible de se connecter. Vérifiez vos identifiants.')
            return
        }

        await navigateTo('/dashboard')
    }
    catch (error) {
        await showError('Connexion impossible', authErrorMessage(error))
    }
    finally {
        loading.value = false
    }
}
</script>

<template>
    <div>
        <h1 class="text-[2rem] font-semibold tracking-tight text-neutral-950">
            Bon retour
        </h1>
        <p class="mt-2 text-sm text-neutral-500">
            Connectez-vous pour accéder à votre espace
        </p>

        <form class="mt-10 flex flex-col gap-5" @submit.prevent="onSubmit">
            <UiInput v-model="email" type="email" name="email" autocomplete="email" label="Adresse e-mail"
                placeholder="nom@atelier.com" icon="fa-regular fa-envelope" required />

            <UiInput v-model="password" type="password" name="password" autocomplete="current-password"
                label="Mot de passe" placeholder="••••••••" icon="fa-solid fa-lock" required>
                <template #label-action>
                    <button type="button" class="transition-colors hover:text-neutral-700">
                        Mot de passe oublié ?
                    </button>
                </template>
            </UiInput>

            <UiButton type="submit" block :loading="loading" class="mt-1">
                Se connecter
                <template #trailing>
                    <i class="fa-solid fa-arrow-right text-xs" />
                </template>
            </UiButton>
        </form>
    </div>
</template>
