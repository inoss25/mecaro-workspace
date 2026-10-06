<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
    label?: string
    description?: string
    name?: string
    id?: string
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
}>(), {
    size: 'md',
    disabled: false,
})

const model = defineModel<boolean>({ default: false })

const generatedId = useId()
const inputId = computed(() => props.id ?? generatedId)
const descriptionId = computed(() => `${inputId.value}-description`)
const hasText = computed(() => Boolean(props.label || props.description))

const trackClass: Record<NonNullable<typeof props.size>, string> = {
    sm: 'h-5 w-9',
    md: 'h-6 w-11',
    lg: 'h-7 w-14',
}

const thumbClass: Record<NonNullable<typeof props.size>, string> = {
    sm: 'size-4 peer-checked:translate-x-4',
    md: 'size-5 peer-checked:translate-x-5',
    lg: 'size-6 peer-checked:translate-x-7',
}
</script>

<template>
    <label
        class="inline-flex items-center gap-3"
        :class="[
            hasText && 'w-full justify-between',
            disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        ]"
    >
        <span
            v-if="hasText"
            class="min-w-0"
        >
            <span
                v-if="label"
                class="block text-sm font-semibold text-neutral-900"
            >
                {{ label }}
            </span>
            <span
                v-if="description"
                :id="descriptionId"
                class="mt-0.5 block text-sm font-normal text-neutral-500"
            >
                {{ description }}
            </span>
        </span>

        <span class="relative inline-flex shrink-0">
            <input
                :id="inputId"
                v-model="model"
                v-bind="$attrs"
                type="checkbox"
                role="switch"
                :name="name"
                :disabled="disabled"
                :aria-checked="model"
                :aria-describedby="description ? descriptionId : undefined"
                class="peer sr-only"
            >
            <span
                aria-hidden="true"
                class="block rounded-full bg-neutral-200 transition-colors duration-150 peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 peer-focus-visible:ring-offset-2"
                :class="trackClass[size]"
            />
            <span
                aria-hidden="true"
                class="pointer-events-none absolute top-0.5 left-0.5 rounded-full bg-white shadow-sm transition-transform duration-150"
                :class="thumbClass[size]"
            />
        </span>
    </label>
</template>
