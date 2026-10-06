<script setup lang="ts">
const props = withDefaults(defineProps<{
    type?: 'button' | 'submit' | 'reset'
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    to?: string
    href?: string
    block?: boolean
    loading?: boolean
    disabled?: boolean
}>(), {
    type: 'button',
    variant: 'primary',
    size: 'md',
    block: false,
    loading: false,
    disabled: false,
})

const component = computed(() => {
    if (props.to) return resolveComponent('NuxtLink')
    if (props.href) return 'a'
    return 'button'
})

const isDisabled = computed(() => props.disabled || props.loading)

const variantClass: Record<NonNullable<typeof props.variant>, string> = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm',
    secondary: 'bg-secondary text-white hover:bg-secondary/90 shadow-sm',
    outline: 'bg-surface text-neutral-900 ring-1 ring-neutral-200 hover:bg-neutral-50 shadow-sm',
    ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
}

const sizeClass: Record<NonNullable<typeof props.size>, string> = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-12 px-5 text-sm',
    lg: 'h-14 px-6 text-[15px]',
}
</script>

<template>
    <component
        :is="component"
        :type="to || href ? undefined : type"
        :to="to"
        :href="href"
        :disabled="to || href ? undefined : isDisabled"
        :aria-disabled="isDisabled || undefined"
        :aria-busy="loading || undefined"
        class="inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        :class="[
            variantClass[variant],
            sizeClass[size],
            block && 'w-full',
            isDisabled && (to || href) && 'pointer-events-none opacity-50',
        ]"
    >
        <span
            v-if="loading"
            class="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
        />
        <slot v-if="!loading" name="leading" />
        <span class="inline-flex items-center gap-2">
            <slot />
        </span>
        <slot v-if="!loading" name="trailing" />
    </component>
</template>
