<script setup lang="ts">
const props = withDefaults(defineProps<{
    src?: string | null
    alt?: string
    name?: string
    initials?: string
    icon?: string
    size?: 'xs' | 'sm' | 'md' | 'lg'
    shape?: 'circle' | 'rounded'
}>(), {
    src: '',
    alt: '',
    size: 'md',
    shape: 'circle',
    icon: 'fa-regular fa-user',
})

const failed = ref(false)

const letters = computed(() => {
    if (props.initials?.trim()) return props.initials.trim().slice(0, 2).toUpperCase()
    const parts = props.name?.trim().split(/\s+/).filter(Boolean) ?? []
    if (!parts.length) return ''
    if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
    return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase()
})

const sizeClass: Record<NonNullable<typeof props.size>, string> = {
    xs: 'size-8 text-xs',
    sm: 'size-9 text-xs',
    md: 'size-12 text-sm',
    lg: 'size-14 text-sm',
}

const shown = computed(() => Boolean(props.src) && !failed.value)

watch(() => props.src, () => {
    failed.value = false
})
</script>

<template>
    <span
        class="inline-flex shrink-0 items-center justify-center overflow-hidden bg-neutral-100 font-semibold text-neutral-500"
        :class="[
            sizeClass[size],
            shape === 'circle' ? 'rounded-full' : 'rounded-2xl',
        ]"
    >
        <slot>
            <img
                v-if="shown"
                :src="src || undefined"
                :alt="alt"
                class="size-full object-cover"
                @error="failed = true"
            >
            <span v-else-if="letters">{{ letters }}</span>
            <i v-else :class="icon" aria-hidden="true" />
        </slot>
    </span>
</template>
