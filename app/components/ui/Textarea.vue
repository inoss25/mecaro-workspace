<script setup lang="ts">
const props = withDefaults(defineProps<{
    label?: string
    placeholder?: string
    error?: string
    hint?: string
    name?: string
    id?: string
    rows?: number
    maxlength?: number
    disabled?: boolean
    required?: boolean
}>(), {
    rows: 4,
    disabled: false,
    required: false,
})

const model = defineModel<string>({ default: '' })
const generatedId = useId()
const inputId = computed(() => props.id ?? generatedId)
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
            class="rounded-2xl bg-neutral-100 px-4 transition-[box-shadow,background-color] duration-150"
            :class="[
                error
                    ? 'ring-2 ring-red-400'
                    : 'focus-within:bg-surface focus-within:ring-2 focus-within:ring-primary/30',
                disabled && 'opacity-60',
            ]"
        >
            <textarea
                :id="inputId"
                v-model="model"
                :name="name"
                :rows="rows"
                :maxlength="maxlength"
                :placeholder="placeholder"
                :disabled="disabled"
                :required="required"
                :aria-invalid="error ? true : undefined"
                :aria-describedby="error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined"
                class="max-h-56 min-h-24 w-full resize-y bg-transparent py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 disabled:cursor-not-allowed"
            />
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
