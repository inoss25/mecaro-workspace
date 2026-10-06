<script setup lang="ts">
defineProps<{
    title: string
    description: string
}>()
</script>

<template>
    <div class="rounded-[28px] bg-surface p-6 shadow-sm sm:p-8">
        <div class="mb-6 flex items-center gap-3">
            <span class="h-0.5 w-8 rounded-full bg-primary" />
            <span class="size-1.5 rounded-full bg-primary/40" />
            <span class="size-1.5 rounded-full bg-primary/20" />
        </div>
        <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div class="min-w-0">
                <h2 class="text-3xl font-semibold tracking-tight text-neutral-950">
                    {{ title }}
                </h2>
                <p class="mt-3 max-w-xl text-sm leading-relaxed text-neutral-500">
                    {{ description }}
                </p>
            </div>
            <div v-if="$slots.actions" class="shrink-0">
                <slot name="actions" />
            </div>
        </div>
    </div>
</template>
