<script setup lang="ts">
type AlertVariant = 'info' | 'warning' | 'danger' | 'success'

const open = defineModel<boolean>({ default: true })

const props = withDefaults(defineProps<{
    variant?: AlertVariant
    title?: string
    text?: string
    icon?: string | false
    closable?: boolean
}>(), {
    variant: 'info',
    closable: false,
})

const emit = defineEmits<{
    close: []
}>()

const appearances: Record<AlertVariant, {
    shell: string
    disc: string
    icon: string
    title: string
    body: string
    close: string
}> = {
    info: {
        shell: 'bg-secondary/5 ring-secondary/15',
        disc: 'bg-secondary/10 text-secondary',
        icon: 'fa-solid fa-info',
        title: 'text-secondary',
        body: 'text-secondary/80',
        close: 'text-secondary/60 hover:bg-secondary/10 hover:text-secondary focus-visible:ring-secondary/40',
    },
    warning: {
        shell: 'bg-amber-50 ring-amber-200',
        disc: 'bg-amber-100 text-amber-600',
        icon: 'fa-solid fa-exclamation',
        title: 'text-amber-950',
        body: 'text-amber-800',
        close: 'text-amber-700/70 hover:bg-amber-100 hover:text-amber-900 focus-visible:ring-amber-400/70',
    },
    danger: {
        shell: 'bg-red-50 ring-red-200',
        disc: 'bg-red-100 text-red-600',
        icon: 'fa-solid fa-xmark',
        title: 'text-red-950',
        body: 'text-red-800',
        close: 'text-red-700/70 hover:bg-red-100 hover:text-red-900 focus-visible:ring-red-400/70',
    },
    success: {
        shell: 'bg-primary/5 ring-primary/15',
        disc: 'bg-primary/10 text-primary',
        icon: 'fa-solid fa-check',
        title: 'text-primary',
        body: 'text-primary/80',
        close: 'text-primary/60 hover:bg-primary/10 hover:text-primary focus-visible:ring-primary/40',
    },
}

const appearance = computed(() => appearances[props.variant])

const iconClass = computed(() => {
    if (props.icon === false) return ''
    return props.icon || appearance.value.icon
})

const liveRole = computed(() => (
    props.variant === 'danger' || props.variant === 'warning' ? 'alert' : 'status'
))

function dismiss() {
    open.value = false
    emit('close')
}
</script>

<template>
    <div
        v-if="open"
        class="flex items-start gap-3 rounded-2xl px-4 py-3.5 ring-1"
        :class="appearance.shell"
        :role="liveRole"
    >
        <slot name="icon" :icon="iconClass" :variant="variant">
            <span
                v-if="iconClass"
                class="flex size-8 shrink-0 items-center justify-center rounded-full"
                :class="appearance.disc"
            >
                <i :class="iconClass" class="text-sm" aria-hidden="true" />
            </span>
        </slot>

        <div class="min-w-0 flex-1">
            <div class="flex items-start gap-3">
                <div class="min-w-0 flex-1 py-0.5">
                    <p
                        v-if="title || $slots.title"
                        class="text-sm font-semibold tracking-tight"
                        :class="appearance.title"
                    >
                        <slot name="title">{{ title }}</slot>
                    </p>
                    <div
                        v-if="text || $slots.default"
                        class="text-pretty text-sm leading-snug"
                        :class="[
                            appearance.body,
                            (title || $slots.title) && 'mt-0.5',
                        ]"
                    >
                        <slot>{{ text }}</slot>
                    </div>
                </div>

                <button
                    v-if="closable"
                    type="button"
                    class="inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2"
                    :class="appearance.close"
                    aria-label="Fermer"
                    @click="dismiss"
                >
                    <slot name="close">
                        <i class="fa-solid fa-xmark text-sm" aria-hidden="true" />
                    </slot>
                </button>
            </div>

            <div
                v-if="$slots.actions"
                class="mt-3 flex flex-wrap items-center gap-2"
            >
                <slot name="actions" />
            </div>
        </div>
    </div>
</template>
