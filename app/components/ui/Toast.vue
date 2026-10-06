<script setup lang="ts">
import type { ToastIcon } from '~/composables/useToast'

const props = withDefaults(defineProps<{
    title: string
    text?: string
    icon?: ToastIcon
    duration?: number
    closable?: boolean
    edge?: 'right' | 'left' | 'down' | 'up'
}>(), {
    duration: 5000,
    closable: true,
    edge: 'right',
})

const emit = defineEmits<{
    dismiss: []
}>()

const progress = ref(100)

let timerHandle = 0
let frame = 0
let endsAt = 0
let durationMs = 0
let remaining = 0
let held = false
let hovering = false
let focusing = false
let finished = false

const appearances: Record<ToastIcon, { disc: string, icon: string, bar: string }> = {
    success: {
        disc: 'bg-primary/10 text-primary',
        icon: 'fa-solid fa-check',
        bar: 'bg-primary',
    },
    error: {
        disc: 'bg-red-100 text-red-600',
        icon: 'fa-solid fa-xmark',
        bar: 'bg-red-500',
    },
    warning: {
        disc: 'bg-amber-100 text-amber-600',
        icon: 'fa-solid fa-exclamation',
        bar: 'bg-amber-500',
    },
    info: {
        disc: 'bg-secondary/10 text-secondary',
        icon: 'fa-solid fa-info',
        bar: 'bg-secondary',
    },
}

const appearance = computed(() => props.icon ? appearances[props.icon] : null)
const liveRole = computed(() => props.icon === 'error' || props.icon === 'warning' ? 'alert' : 'status')

function stopTimer() {
    if (!import.meta.client) return
    held = false
    window.clearTimeout(timerHandle)
    cancelAnimationFrame(frame)
    timerHandle = 0
    frame = 0
}

function tick() {
    if (!durationMs || held) return
    const left = Math.max(0, endsAt - performance.now())
    progress.value = (left / durationMs) * 100
    if (left > 0) frame = requestAnimationFrame(tick)
}

function arm(ms: number) {
    if (!import.meta.client || !props.duration) return
    window.clearTimeout(timerHandle)
    cancelAnimationFrame(frame)
    durationMs = props.duration
    remaining = ms
    endsAt = performance.now() + ms
    progress.value = (ms / props.duration) * 100
    held = false
    timerHandle = window.setTimeout(finish, ms)
    frame = requestAnimationFrame(tick)
}

function hold() {
    if (!import.meta.client || !props.duration || held || !timerHandle) return
    remaining = Math.max(0, endsAt - performance.now())
    held = true
    window.clearTimeout(timerHandle)
    cancelAnimationFrame(frame)
    timerHandle = 0
    progress.value = (remaining / durationMs) * 100
}

function release() {
    if (!props.duration || !held) return
    arm(remaining)
}

function finish() {
    if (finished) return
    finished = true
    stopTimer()
    emit('dismiss')
}

function onEnter() {
    hovering = true
    hold()
}

function onLeave() {
    hovering = false
    if (!focusing) release()
}

function onFocusIn() {
    focusing = true
    hold()
}

function onFocusOut(event: FocusEvent) {
    const next = event.relatedTarget
    const current = event.currentTarget
    if (next instanceof Node && current instanceof Node && current.contains(next)) return
    focusing = false
    if (!hovering) release()
}

onMounted(() => {
    if (props.duration > 0) arm(props.duration)
})

onBeforeUnmount(() => {
    stopTimer()
})
</script>

<template>
    <article
        class="ui-toast pointer-events-auto relative w-full overflow-hidden rounded-lg bg-surface text-neutral-900 shadow-lg shadow-black/10 ring-1 ring-neutral-200"
        :data-edge="edge"
        :role="liveRole"
        @mouseenter="onEnter"
        @mouseleave="onLeave"
        @focusin="onFocusIn"
        @focusout="onFocusOut"
    >
        <div class="flex items-start gap-3 px-3.5 py-3">
            <span
                v-if="appearance"
                class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full"
                :class="appearance.disc"
            >
                <i :class="appearance.icon" class="text-sm" aria-hidden="true" />
            </span>

            <div class="min-w-0 flex-1 py-0.5">
                <p class="text-sm font-semibold tracking-tight text-neutral-950">
                    {{ title }}
                </p>
                <p v-if="text" class="mt-0.5 text-pretty text-sm leading-snug text-neutral-500">
                    {{ text }}
                </p>
            </div>

            <button
                v-if="closable"
                type="button"
                class="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                aria-label="Fermer"
                @click="finish"
            >
                <i class="fa-solid fa-xmark text-sm" aria-hidden="true" />
            </button>
        </div>

        <div
            v-if="duration > 0"
            class="h-0.5 bg-neutral-100"
            aria-hidden="true"
        >
            <div
                class="h-full w-full origin-left"
                :class="appearance?.bar ?? 'bg-primary'"
                :style="{ transform: `scaleX(${progress / 100})` }"
            />
        </div>
    </article>
</template>

<style scoped>
.ui-toast-enter-active,
.ui-toast-leave-active,
.ui-toast-move {
    transition: opacity 200ms ease, transform 200ms ease;
}

.ui-toast-enter-from,
.ui-toast-leave-to {
    opacity: 0;
}

.ui-toast-enter-from[data-edge="right"],
.ui-toast-leave-to[data-edge="right"] {
    transform: translateX(0.75rem);
}

.ui-toast-enter-from[data-edge="left"],
.ui-toast-leave-to[data-edge="left"] {
    transform: translateX(-0.75rem);
}

.ui-toast-enter-from[data-edge="down"],
.ui-toast-leave-to[data-edge="down"] {
    transform: translateY(-0.75rem);
}

.ui-toast-enter-from[data-edge="up"],
.ui-toast-leave-to[data-edge="up"] {
    transform: translateY(0.75rem);
}

.ui-toast-leave-active {
    position: absolute;
    right: 0;
    left: 0;
}

@media (prefers-reduced-motion: reduce) {
    .ui-toast-enter-active,
    .ui-toast-leave-active,
    .ui-toast-move {
        transition: none;
    }
}
</style>
