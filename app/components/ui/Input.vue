<script setup lang="ts">
const props = withDefaults(defineProps<{
    label?: string
    type?: string
    placeholder?: string
    error?: string
    hint?: string
    icon?: string
    name?: string
    autocomplete?: string
    id?: string
    disabled?: boolean
    required?: boolean
    hideToggle?: boolean
}>(), {
    type: 'text',
    disabled: false,
    required: false,
    hideToggle: false,
})

const model = defineModel<string>({ default: '' })
const showPassword = ref(false)
const generatedId = useId()
const inputId = computed(() => props.id ?? generatedId)
const isPassword = computed(() => props.type === 'password')
const currentType = computed(() => (
    isPassword.value && showPassword.value ? 'text' : props.type
))
</script>

<template>
    <div class="flex w-full flex-col gap-2">
        <div
            v-if="label || $slots['label-action']"
            class="flex items-center justify-between gap-3"
        >
            <label
                v-if="label"
                :for="inputId"
                class="text-sm font-semibold text-neutral-900"
            >
                {{ label }}
            </label>
            <div
                v-if="$slots['label-action']"
                class="text-[11px] font-semibold uppercase tracking-wide text-neutral-400"
            >
                <slot name="label-action" />
            </div>
        </div>

        <div
            class="flex items-center gap-3 rounded-full bg-neutral-100 px-4 transition-[box-shadow,background-color] duration-150"
            :class="[
                error
                    ? 'ring-2 ring-red-400'
                    : 'focus-within:bg-surface focus-within:ring-2 focus-within:ring-primary/30',
                disabled && 'opacity-60',
            ]"
        >
            <span
                v-if="icon || $slots.leading"
                class="shrink-0 text-neutral-400"
                aria-hidden="true"
            >
                <slot name="leading">
                    <i :class="icon" />
                </slot>
            </span>

            <input
                :id="inputId"
                v-model="model"
                :type="currentType"
                :placeholder="placeholder"
                :disabled="disabled"
                :required="required"
                :name="name"
                :autocomplete="autocomplete"
                :aria-invalid="error ? true : undefined"
                :aria-describedby="error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined"
                class="h-12 min-w-0 flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400 disabled:cursor-not-allowed"
            >

            <button
                v-if="isPassword && !hideToggle"
                type="button"
                class="shrink-0 p-1 text-neutral-400 transition-colors hover:text-neutral-600"
                :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
                @click="showPassword = !showPassword"
            >
                <i :class="showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'" />
            </button>

            <slot name="trailing" />
        </div>

        <p
            v-if="error"
            :id="`${inputId}-error`"
            class="text-sm text-red-600"
        >
            {{ error }}
        </p>
        <p
            v-else-if="hint"
            :id="`${inputId}-hint`"
            class="text-sm text-neutral-500"
        >
            {{ hint }}
        </p>
    </div>
</template>
