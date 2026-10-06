<script setup lang="ts">
import { GENDER_OPTIONS, STATUS_OPTIONS } from '../utils/options'
import { todayInputValue, validateUserImage, type UserFormState } from '../utils/form'

const props = withDefaults(defineProps<{
    errors?: Record<string, string>
    disabled?: boolean
    mode?: 'create' | 'edit'
    imageUrl?: string | null
}>(), {
    errors: () => ({}),
    disabled: false,
    mode: 'create',
    imageUrl: '',
})

const firstName = defineModel<UserFormState['first_name']>('firstName', { required: true })
const lastName = defineModel<UserFormState['last_name']>('lastName', { required: true })
const email = defineModel<UserFormState['email']>('email', { required: true })
const phoneNumber = defineModel<UserFormState['phone_number']>('phoneNumber', { required: true })
const password = defineModel<UserFormState['password']>('password', { required: true })
const passwordConfirmation = defineModel<UserFormState['password_confirmation']>('passwordConfirmation', { required: true })
const gender = defineModel<UserFormState['gender']>('gender', { required: true })
const status = defineModel<UserFormState['status']>('status', { required: true })
const birthDate = defineModel<UserFormState['birth_date']>('birthDate', { required: true })
const imageFile = defineModel<File | null>('imageFile', { default: null })
const imageError = defineModel<string>('imageError', { default: '' })

const imageInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref('')
const today = todayInputValue()
const shownImage = computed(() => previewUrl.value || props.imageUrl || '')

watch(imageFile, (file) => {
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = file ? URL.createObjectURL(file) : ''
})

onBeforeUnmount(() => {
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})

function clearImage() {
    imageFile.value = null
    imageError.value = ''
    if (imageInput.value) imageInput.value.value = ''
}

function onImageChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) {
        clearImage()
        return
    }

    const message = validateUserImage(file)
    if (message) {
        imageError.value = message
        imageFile.value = null
        if (imageInput.value) imageInput.value.value = ''
        return
    }

    imageError.value = ''
    imageFile.value = file
}
</script>

<template>
    <div class="grid gap-5 sm:grid-cols-2">
        <UiInput
            v-model="firstName"
            name="first_name"
            autocomplete="given-name"
            label="Prénom"
            placeholder="Awa"
            icon="fa-regular fa-user"
            :error="errors.first_name"
            :disabled="disabled"
            data-autofocus
        />

        <UiInput
            v-model="lastName"
            name="last_name"
            autocomplete="family-name"
            label="Nom"
            placeholder="Diallo"
            icon="fa-regular fa-user"
            :error="errors.last_name"
            :disabled="disabled"
        />

        <UiInput
            v-model="email"
            type="email"
            name="email"
            autocomplete="email"
            label="Adresse e-mail"
            placeholder="awa.diallo@atelier.com"
            icon="fa-regular fa-envelope"
            :error="errors.email"
            :disabled="disabled"
        />

        <UiInput
            v-model="phoneNumber"
            type="tel"
            name="phone_number"
            autocomplete="tel"
            label="Téléphone"
            placeholder="+226 70 00 00 00"
            icon="fa-solid fa-phone"
            :error="errors.phone_number"
            :disabled="disabled"
        />

        <template v-if="mode === 'create'">
            <UiInput
                v-model="password"
                type="password"
                name="password"
                autocomplete="new-password"
                label="Mot de passe"
                placeholder="••••••••"
                icon="fa-solid fa-lock"
                hint="Facultatif. 8 caractères minimum s’il est renseigné."
                :error="errors.password"
                :disabled="disabled"
            />

            <UiInput
                v-model="passwordConfirmation"
                type="password"
                name="password_confirmation"
                autocomplete="new-password"
                label="Confirmation"
                placeholder="••••••••"
                icon="fa-solid fa-lock"
                :error="errors.password_confirmation"
                :disabled="disabled"
            />
        </template>

        <div v-else class="flex flex-col gap-2">
            <label for="user-birth-date" class="text-sm font-semibold text-neutral-900">
                Date de naissance
            </label>
            <div
                class="flex items-center gap-3 rounded-full bg-neutral-100 px-4 transition-[box-shadow,background-color] duration-150 focus-within:bg-surface focus-within:ring-2 focus-within:ring-primary/30"
                :class="[
                    errors.birth_date && 'ring-2 ring-red-400',
                    disabled && 'opacity-60',
                ]"
            >
                <i class="fa-regular fa-calendar text-neutral-400" aria-hidden="true" />
                <input
                    id="user-birth-date"
                    v-model="birthDate"
                    type="date"
                    name="birth_date"
                    autocomplete="bday"
                    :max="today"
                    :disabled="disabled"
                    class="h-12 min-w-0 flex-1 bg-transparent text-sm text-neutral-900 outline-none disabled:cursor-not-allowed"
                >
            </div>
            <p v-if="errors.birth_date" class="text-sm text-red-600">
                {{ errors.birth_date }}
            </p>
        </div>

        <fieldset class="sm:col-span-2">
            <legend class="text-sm font-semibold text-neutral-900">
                Statut
            </legend>
            <div class="mt-2 flex flex-wrap gap-2">
                <button
                    v-for="option in STATUS_OPTIONS"
                    :key="option.value"
                    type="button"
                    class="h-10 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
                    :class="status === option.value
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'"
                    :aria-pressed="status === option.value"
                    :disabled="disabled"
                    @click="status = option.value"
                >
                    {{ option.label }}
                </button>
            </div>
            <p v-if="errors.status" class="mt-2 text-sm text-red-600">
                {{ errors.status }}
            </p>
        </fieldset>

        <fieldset class="sm:col-span-2">
            <legend class="text-sm font-semibold text-neutral-900">
                Genre
            </legend>
            <div class="mt-2 flex flex-wrap gap-2">
                <button
                    v-for="option in GENDER_OPTIONS"
                    :key="option.value"
                    type="button"
                    class="h-10 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
                    :class="gender === option.value
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'"
                    :aria-pressed="gender === option.value"
                    :disabled="disabled"
                    @click="gender = gender === option.value ? '' : option.value"
                >
                    {{ option.label }}
                </button>
            </div>
        </fieldset>

        <div class="flex flex-col gap-2 sm:col-span-2">
            <p class="text-sm font-semibold text-neutral-900">
                Photo
            </p>
            <div class="flex flex-wrap items-center gap-4">
                <span class="flex size-14 items-center justify-center overflow-hidden rounded-full bg-neutral-100 text-sm font-semibold text-neutral-400">
                    <img
                        v-if="shownImage"
                        :src="shownImage"
                        alt=""
                        class="size-full object-cover"
                    >
                    <i v-else class="fa-regular fa-image" />
                </span>
                <label
                    class="inline-flex h-10 cursor-pointer items-center rounded-full bg-neutral-100 px-4 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-200"
                    :class="disabled && 'pointer-events-none opacity-60'"
                >
                    Choisir une image
                    <input
                        ref="imageInput"
                        type="file"
                        accept="image/*"
                        class="sr-only"
                        :disabled="disabled"
                        @change="onImageChange"
                    >
                </label>
                <button
                    v-if="imageFile"
                    type="button"
                    class="text-sm font-semibold text-neutral-500 transition-colors hover:text-neutral-800"
                    :disabled="disabled"
                    @click="clearImage"
                >
                    Retirer
                </button>
            </div>
            <p v-if="imageError" class="text-sm text-red-600">
                {{ imageError }}
            </p>
            <p v-else class="text-sm text-neutral-500">
                JPG ou PNG, 2 Mo maximum.
            </p>
        </div>
    </div>
</template>
