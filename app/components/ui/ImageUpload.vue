<script setup lang="ts">
const props = withDefaults(defineProps<{
    label?: string
    hint?: string
    error?: string
    accept?: string
    src?: string | null
    name?: string
    buttonLabel?: string
    clearLabel?: string
    emptyIcon?: string
    shape?: 'circle' | 'rounded'
    disabled?: boolean
    required?: boolean
}>(), {
    accept: 'image/*',
    src: '',
    buttonLabel: 'Choisir une image',
    clearLabel: 'Retirer',
    emptyIcon: 'fa-regular fa-image',
    shape: 'circle',
    disabled: false,
    required: false,
})

const file = defineModel<File | null>({ default: null })
const inputRef = ref<HTMLInputElement | null>(null)
const objectUrl = ref('')
const generatedId = useId()

const preview = computed(() => objectUrl.value || props.src || '')

watch(file, (next) => {
    if (objectUrl.value) URL.revokeObjectURL(objectUrl.value)
    objectUrl.value = next && import.meta.client ? URL.createObjectURL(next) : ''
    if (!next && inputRef.value) inputRef.value.value = ''
}, { immediate: true })

onBeforeUnmount(() => {
    if (objectUrl.value) URL.revokeObjectURL(objectUrl.value)
})

function onChange(event: Event) {
    const next = (event.target as HTMLInputElement).files?.[0] ?? null
    file.value = next
}

function clear() {
    file.value = null
    if (inputRef.value) inputRef.value.value = ''
}
</script>

<template>
    <div class="flex w-full flex-col gap-2">
        <div
            v-if="label || $slots['label-action']"
            class="flex items-center justify-between gap-3"
        >
            <p v-if="label" class="text-sm font-semibold text-neutral-900">
                {{ label }}
            </p>
            <div
                v-if="$slots['label-action']"
                class="text-[11px] font-semibold uppercase tracking-wide text-neutral-400"
            >
                <slot name="label-action" />
            </div>
        </div>

        <div class="flex flex-wrap items-center gap-4">
            <span
                class="flex size-14 items-center justify-center overflow-hidden bg-neutral-100 text-neutral-400"
                :class="shape === 'circle' ? 'rounded-full' : 'rounded-2xl'"
            >
                <slot name="preview" :src="preview" :file="file">
                    <img
                        v-if="preview"
                        :src="preview"
                        alt=""
                        class="size-full object-cover"
                    >
                    <slot v-else name="placeholder">
                        <i :class="emptyIcon" aria-hidden="true" />
                    </slot>
                </slot>
            </span>

            <label
                :for="generatedId"
                class="inline-flex h-10 cursor-pointer items-center rounded-full bg-neutral-100 px-4 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-200"
                :class="disabled && 'pointer-events-none opacity-60'"
            >
                {{ buttonLabel }}
                <input
                    :id="generatedId"
                    ref="inputRef"
                    type="file"
                    class="sr-only"
                    :name="name"
                    :accept="accept"
                    :disabled="disabled"
                    :required="required && !file && !src"
                    :aria-invalid="error ? true : undefined"
                    :aria-describedby="error ? `${generatedId}-error` : hint ? `${generatedId}-hint` : undefined"
                    @change="onChange"
                >
            </label>

            <button
                v-if="file"
                type="button"
                class="text-sm font-semibold text-neutral-500 transition-colors hover:text-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="disabled"
                @click="clear"
            >
                {{ clearLabel }}
            </button>
        </div>

        <p
            v-if="error"
            :id="`${generatedId}-error`"
            class="text-sm text-red-600"
        >
            {{ error }}
        </p>
        <p
            v-else-if="hint"
            :id="`${generatedId}-hint`"
            class="text-sm text-neutral-500"
        >
            {{ hint }}
        </p>
    </div>
</template>
