<script setup lang="ts">
import type { AlertDialogProps, AlertDismissReason, AlertIcon } from '~/composables/useAlert'

const open = defineModel<boolean>({ default: false })

const props = withDefaults(defineProps<AlertDialogProps>(), {
    confirmText: 'OK',
    cancelText: 'Annuler',
    denyText: 'Refuser',
    showCancel: false,
    showDeny: false,
    showConfirm: true,
    confirmVariant: 'primary',
    showClose: false,
    inputOptions: () => [],
    closeOnOverlay: true,
    closeOnEscape: true,
})

const emit = defineEmits<{
    confirm: [value?: string]
    cancel: []
    deny: [value?: string]
    dismiss: [reason: AlertDismissReason]
}>()

const titleId = useId()
const descriptionId = useId()
const inputId = useId()
const errorId = useId()

const draft = ref(props.inputValue ?? '')
const pending = ref(false)
const shaking = ref(false)
const validationError = ref('')
const progress = ref(100)

let timerHandle = 0
let frame = 0
let endsAt = 0
let duration = 0
let remaining = 0
let paused = false

const appearances: Record<AlertIcon, { halo: string, disc: string, icon: string, bar: string, label: string }> = {
    success: {
        halo: 'bg-primary/5',
        disc: 'bg-primary/10 text-primary',
        icon: 'fa-solid fa-check',
        bar: 'bg-primary',
        label: 'Succès',
    },
    error: {
        halo: 'bg-red-50',
        disc: 'bg-red-100 text-red-600',
        icon: 'fa-solid fa-xmark',
        bar: 'bg-red-500',
        label: 'Erreur',
    },
    warning: {
        halo: 'bg-amber-50',
        disc: 'bg-amber-100 text-amber-600',
        icon: 'fa-solid fa-exclamation',
        bar: 'bg-amber-500',
        label: 'Attention',
    },
    info: {
        halo: 'bg-secondary/5',
        disc: 'bg-secondary/10 text-secondary',
        icon: 'fa-solid fa-info',
        bar: 'bg-secondary',
        label: 'Information',
    },
    question: {
        halo: 'bg-neutral-100',
        disc: 'bg-surface text-neutral-700 ring-1 ring-neutral-200',
        icon: 'fa-solid fa-question',
        bar: 'bg-neutral-700',
        label: 'Question',
    },
}

const appearance = computed(() => props.icon ? appearances[props.icon] : null)

const labelledBy = computed(() => props.title ? titleId : undefined)
const describedBy = computed(() => props.text ? descriptionId : undefined)
const ariaLabel = computed(() => {
    if (props.title) return undefined
    return appearance.value?.label ?? 'Alerte'
})

const focusCancelButton = computed(() => {
    if (props.input) return false
    if (props.focusCancel != null) return props.focusCancel
    return Boolean(props.showCancel && props.confirmVariant === 'danger')
})

const nativeInputType = computed(() => {
    if (props.input === 'email' || props.input === 'password' || props.input === 'number') return props.input
    return 'text'
})

const inputMode = computed(() => {
    if (props.input === 'email') return 'email'
    if (props.input === 'number') return 'numeric'
    return undefined
})

const fieldClass = computed(() => (
    validationError.value
        ? 'ring-2 ring-red-400'
        : 'focus-within:bg-surface focus-within:ring-2 focus-within:ring-primary/30'
))

function stopTimer() {
    if (!import.meta.client) return
    paused = false
    window.clearTimeout(timerHandle)
    cancelAnimationFrame(frame)
    timerHandle = 0
    frame = 0
}

function tick() {
    if (!duration || paused) return
    const left = Math.max(0, endsAt - performance.now())
    progress.value = (left / duration) * 100
    if (left > 0) frame = requestAnimationFrame(tick)
}

function arm(ms: number) {
    if (!import.meta.client || !props.timer) return
    window.clearTimeout(timerHandle)
    cancelAnimationFrame(frame)
    duration = props.timer
    remaining = ms
    endsAt = performance.now() + ms
    progress.value = (ms / props.timer) * 100
    paused = false
    timerHandle = window.setTimeout(() => dismiss('timer'), ms)
    frame = requestAnimationFrame(tick)
}

function pauseTimer() {
    if (!import.meta.client || !props.timer || !open.value || paused || !timerHandle) return
    remaining = Math.max(0, endsAt - performance.now())
    paused = true
    window.clearTimeout(timerHandle)
    cancelAnimationFrame(frame)
    timerHandle = 0
    progress.value = (remaining / duration) * 100
}

function resumeTimer() {
    if (!import.meta.client || !props.timer || !open.value || !paused) return
    arm(remaining)
}

function fail(message: string) {
    validationError.value = message
    shaking.value = false
    nextTick(() => {
        shaking.value = true
        document.getElementById(inputId)?.focus()
    })
}

function messageFrom(error: unknown) {
    if (error instanceof Error && error.message.trim()) return error.message
    if (typeof error === 'string' && error.trim()) return error
    return 'Une erreur est survenue.'
}

function dismiss(reason: AlertDismissReason) {
    if (!open.value || pending.value) return
    stopTimer()
    emit('dismiss', reason)
    open.value = false
}

function onModalClose(reason: 'overlay' | 'escape' | 'close') {
    if (pending.value) {
        open.value = true
        return
    }
    stopTimer()
    emit('dismiss', reason)
}

function onCancel() {
    if (pending.value) return
    stopTimer()
    emit('cancel')
    open.value = false
}

function onDeny() {
    if (pending.value) return
    stopTimer()
    emit('deny', props.input ? draft.value : undefined)
    open.value = false
}

async function onConfirm() {
    if (pending.value || !props.showConfirm) return
    pending.value = true
    stopTimer()

    const value = props.input ? draft.value : undefined

    try {
        if (props.input && props.inputValidator) {
            const message = await props.inputValidator(value ?? '')
            if (typeof message === 'string' && message.trim()) {
                fail(message)
                return
            }
        }

        let resolved = value
        if (props.preConfirm) {
            const returned = await props.preConfirm(value)
            if (returned === false) return
            if (typeof returned === 'string') resolved = returned
        }

        emit('confirm', resolved)
        open.value = false
    }
    catch (error) {
        fail(messageFrom(error))
    }
    finally {
        pending.value = false
        if (open.value && props.timer) arm(props.timer)
    }
}

function onEnter(event: KeyboardEvent) {
    const target = event.target
    if (target instanceof HTMLButtonElement || target instanceof HTMLSelectElement) return
    if (target instanceof HTMLTextAreaElement && !event.metaKey && !event.ctrlKey) return
    event.preventDefault()
    void onConfirm()
}

watch(open, (isOpen) => {
    if (!isOpen) {
        stopTimer()
        return
    }
    draft.value = props.inputValue ?? ''
    const firstOption = props.inputOptions[0]
    if (props.input === 'select' && !draft.value && !props.inputPlaceholder && firstOption) {
        draft.value = firstOption.value
    }
    validationError.value = ''
    shaking.value = false
    pending.value = false
    if (props.timer) arm(props.timer)
}, { immediate: true })

onBeforeUnmount(() => {
    stopTimer()
})
</script>

<template>
    <UiModal
        v-model="open"
        role="alertdialog"
        size="sm"
        elevated
        placement="center"
        :hide-close="!showClose"
        :close-on-overlay="closeOnOverlay && !pending"
        :close-on-escape="closeOnEscape && !pending"
        :labelled-by="labelledBy"
        :described-by="describedBy"
        :aria-label="ariaLabel"
        @close="onModalClose"
        @keydown.enter="onEnter"
        @mouseenter="pauseTimer"
        @mouseleave="resumeTimer"
    >
        <div class="text-center" :class="shaking && 'ui-alert-shake'">
            <div
                v-if="appearance"
                class="ui-alert-icon mx-auto mb-5 flex size-24 items-center justify-center rounded-full"
                :class="appearance.halo"
            >
                <span
                    class="flex size-16 items-center justify-center rounded-full"
                    :class="appearance.disc"
                >
                    <i :class="appearance.icon" class="text-2xl" aria-hidden="true" />
                </span>
            </div>

            <h2
                v-if="title"
                :id="titleId"
                class="text-balance text-2xl font-semibold tracking-tight text-neutral-950"
            >
                {{ title }}
            </h2>
            <p
                v-if="text"
                :id="descriptionId"
                class="text-pretty text-sm leading-relaxed text-neutral-500"
                :class="title ? 'mt-2' : ''"
            >
                {{ text }}
            </p>

            <div v-if="input" class="mt-5 text-left">
                <label
                    :for="inputId"
                    :class="inputLabel ? 'mb-2 block text-sm font-semibold text-neutral-900' : 'sr-only'"
                >
                    {{ inputLabel || title || 'Saisie' }}
                </label>

                <div
                    v-if="input === 'textarea'"
                    class="rounded-2xl bg-neutral-100 px-4 py-3 transition-[box-shadow,background-color]"
                    :class="fieldClass"
                >
                    <textarea
                        :id="inputId"
                        v-model="draft"
                        rows="3"
                        data-autofocus
                        :placeholder="inputPlaceholder"
                        :disabled="pending"
                        :aria-invalid="validationError ? true : undefined"
                        :aria-describedby="validationError ? errorId : undefined"
                        class="max-h-40 min-h-24 w-full resize-none bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400 disabled:cursor-not-allowed"
                    />
                </div>

                <div v-else-if="input === 'select'" class="relative">
                    <select
                        :id="inputId"
                        v-model="draft"
                        data-autofocus
                        :disabled="pending"
                        :aria-invalid="validationError ? true : undefined"
                        :aria-describedby="validationError ? errorId : undefined"
                        class="h-12 w-full appearance-none rounded-full bg-neutral-100 px-4 pr-10 text-sm text-neutral-900 outline-none transition-[box-shadow,background-color] disabled:cursor-not-allowed"
                        :class="fieldClass"
                    >
                        <option v-if="inputPlaceholder" value="" disabled>
                            {{ inputPlaceholder }}
                        </option>
                        <option
                            v-for="option in inputOptions"
                            :key="option.value"
                            :value="option.value"
                        >
                            {{ option.label }}
                        </option>
                    </select>
                    <i
                        class="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs text-neutral-400"
                        aria-hidden="true"
                    />
                </div>

                <div
                    v-else
                    class="flex items-center rounded-full bg-neutral-100 px-4 transition-[box-shadow,background-color]"
                    :class="fieldClass"
                >
                    <input
                        :id="inputId"
                        v-model="draft"
                        data-autofocus
                        :type="nativeInputType"
                        :inputmode="inputMode"
                        :placeholder="inputPlaceholder"
                        :disabled="pending"
                        autocomplete="off"
                        :aria-invalid="validationError ? true : undefined"
                        :aria-describedby="validationError ? errorId : undefined"
                        class="h-12 min-w-0 flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400 disabled:cursor-not-allowed"
                    >
                </div>
            </div>

            <p
                v-if="validationError"
                :id="errorId"
                class="mt-3 text-sm font-medium text-red-600"
                :class="input ? 'text-left' : ''"
                role="alert"
            >
                {{ validationError }}
            </p>

            <div
                v-if="showDeny || showCancel || showConfirm"
                class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-center"
            >
                <UiButton
                    v-if="showDeny"
                    variant="ghost"
                    class="w-full sm:w-auto sm:min-w-28"
                    :disabled="pending"
                    @click="onDeny"
                >
                    {{ denyText }}
                </UiButton>
                <UiButton
                    v-if="showCancel"
                    variant="outline"
                    class="w-full sm:w-auto sm:min-w-28"
                    :disabled="pending"
                    :data-autofocus="focusCancelButton ? '' : undefined"
                    @click="onCancel"
                >
                    {{ cancelText }}
                </UiButton>
                <UiButton
                    v-if="showConfirm"
                    :variant="confirmVariant"
                    class="w-full sm:w-auto sm:min-w-28"
                    :loading="pending"
                    :data-autofocus="!input && !focusCancelButton ? '' : undefined"
                    @click="onConfirm"
                >
                    {{ confirmText }}
                </UiButton>
            </div>
        </div>

        <div
            v-if="timer"
            class="mt-6 h-1 overflow-hidden rounded-full bg-neutral-100"
            aria-hidden="true"
        >
            <div
                class="h-full w-full origin-left"
                :class="appearance?.bar ?? 'bg-primary'"
                :style="{ transform: `scaleX(${progress / 100})` }"
            />
        </div>
    </UiModal>
</template>

<style scoped>
.ui-alert-icon {
    animation: ui-alert-pop 320ms cubic-bezier(0.2, 0.9, 0.2, 1);
}

.ui-alert-shake {
    animation: ui-alert-shake 380ms ease;
}

@keyframes ui-alert-pop {
    0% {
        transform: scale(0.5);
        opacity: 0;
    }

    70% {
        transform: scale(1.06);
        opacity: 1;
    }

    100% {
        transform: scale(1);
        opacity: 1;
    }
}

@keyframes ui-alert-shake {
    0%,
    100% {
        transform: translateX(0);
    }

    15% {
        transform: translateX(-6px);
    }

    30% {
        transform: translateX(5px);
    }

    45% {
        transform: translateX(-4px);
    }

    60% {
        transform: translateX(3px);
    }

    75% {
        transform: translateX(-1px);
    }
}

@media (prefers-reduced-motion: reduce) {
    .ui-alert-icon,
    .ui-alert-shake {
        animation: none;
    }
}
</style>
