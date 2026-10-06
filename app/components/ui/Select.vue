<script setup lang="ts">
export type SelectOption = {
    value: string | number
    label: string
    disabled?: boolean
}

const props = withDefaults(defineProps<{
    options: SelectOption[]
    label?: string
    placeholder?: string
    error?: string
    hint?: string
    icon?: string
    prefix?: string
    name?: string
    id?: string
    size?: 'sm' | 'md'
    variant?: 'field' | 'inline'
    controlClass?: string
    block?: boolean
    disabled?: boolean
    required?: boolean
}>(), {
    size: 'md',
    variant: 'field',
    block: true,
    disabled: false,
    required: false,
})

const model = defineModel<string | number>({ default: '' })
const generatedId = useId()
const inputId = computed(() => props.id ?? generatedId)
const describedBy = computed(() => {
    if (props.error) return `${inputId.value}-error`
    if (props.hint) return `${inputId.value}-hint`
    return undefined
})

const showEmptyOption = computed(() => {
    if (props.placeholder) return true
    return !props.options.some(option => String(option.value) === String(model.value))
})

function onChange(event: Event) {
    const raw = (event.target as HTMLSelectElement).value
    const match = props.options.find(option => String(option.value) === raw)
    model.value = match ? match.value : raw
}
</script>

<template>
    <div
        class="flex flex-col gap-2"
        :class="variant === 'inline' || !block ? 'w-fit' : 'w-full'"
    >
        <div
            v-if="variant === 'field' && (label || $slots['label-action'])"
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
            class="flex items-center transition-[box-shadow,background-color] duration-150"
            :class="[
                variant === 'inline'
                    ? 'relative inline-flex'
                    : size === 'sm'
                        ? 'h-10 gap-3 rounded-full bg-neutral-100 px-4'
                        : 'h-12 gap-3 rounded-full bg-neutral-100 px-4',
                variant !== 'inline' && (error
                    ? 'ring-2 ring-red-400'
                    : 'focus-within:bg-surface focus-within:ring-2 focus-within:ring-primary/30'),
                disabled && 'opacity-60',
            ]"
        >
            <span
                v-if="variant === 'field' && (icon || $slots.leading)"
                class="shrink-0 text-neutral-400"
                aria-hidden="true"
            >
                <slot name="leading">
                    <i :class="icon" />
                </slot>
            </span>

            <span
                v-if="prefix"
                class="shrink-0 text-sm text-neutral-500"
            >
                {{ prefix }}
            </span>

            <select
                :id="inputId"
                :value="model === undefined || model === null ? '' : String(model)"
                :name="name"
                :disabled="disabled"
                :required="required"
                :aria-label="variant === 'inline' ? label : undefined"
                :aria-invalid="error ? true : undefined"
                :aria-describedby="describedBy"
                class="appearance-none bg-transparent text-neutral-900 outline-none disabled:cursor-not-allowed"
                :class="[
                    variant === 'inline'
                        ? 'h-8 rounded-full py-1 pr-7 pl-3 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-primary/40'
                        : size === 'sm'
                            ? 'h-10 min-w-0 flex-1 pr-1 text-sm font-semibold'
                            : 'h-12 min-w-0 flex-1 pr-1 text-sm',
                    controlClass,
                ]"
                @change="onChange"
            >
                <option
                    v-if="showEmptyOption"
                    value=""
                    disabled
                >
                    {{ placeholder || 'Choisir' }}
                </option>
                <option
                    v-for="option in options"
                    :key="String(option.value)"
                    :value="String(option.value)"
                    :disabled="option.disabled"
                >
                    {{ option.label }}
                </option>
            </select>

            <i
                class="fa-solid fa-chevron-down pointer-events-none shrink-0"
                :class="variant === 'inline'
                    ? 'absolute top-1/2 right-2.5 -translate-y-1/2 text-[9px] text-current opacity-70'
                    : 'text-[10px] text-neutral-400'"
                aria-hidden="true"
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
            v-else-if="hint && variant === 'field'"
            :id="`${inputId}-hint`"
            class="text-sm text-neutral-500"
        >
            {{ hint }}
        </p>
    </div>
</template>
