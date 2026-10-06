<script lang="ts">
const modalStack: symbol[] = []

function lockBodyScroll() {
    const count = Number(document.body.dataset.uiModalLocks || '0')
    if (count === 0)
        document.body.dataset.uiModalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.body.dataset.uiModalLocks = String(count + 1)
}

function unlockBodyScroll() {
    const count = Math.max(0, Number(document.body.dataset.uiModalLocks || '0') - 1)
    if (count === 0) {
        document.body.style.overflow = document.body.dataset.uiModalOverflow ?? ''
        delete document.body.dataset.uiModalOverflow
        delete document.body.dataset.uiModalLocks
        return
    }
    document.body.dataset.uiModalLocks = String(count)
}

const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[contenteditable="true"]',
    '[tabindex]:not([tabindex="-1"])',
].join(',')
</script>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const open = defineModel<boolean>({ default: false })

const props = withDefaults(defineProps<{
    title?: string
    description?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    role?: 'dialog' | 'alertdialog'
    ariaLabel?: string
    closeLabel?: string
    labelledBy?: string
    describedBy?: string
    closeOnOverlay?: boolean
    closeOnEscape?: boolean
    hideClose?: boolean
    elevated?: boolean
    placement?: 'center' | 'sheet'
}>(), {
    size: 'md',
    role: 'dialog',
    closeLabel: 'Fermer',
    closeOnOverlay: true,
    closeOnEscape: true,
    hideClose: false,
    elevated: false,
    placement: 'sheet',
})

const emit = defineEmits<{
    close: [reason: 'overlay' | 'escape' | 'close']
}>()

const slots = useSlots()
const titleId = useId()
const descriptionId = useId()
const uid = Symbol('ui-modal')
const panelRef = ref<HTMLElement | null>(null)

let active = false
let previouslyFocused: HTMLElement | null = null

const sizeClass: Record<NonNullable<typeof props.size>, string> = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
    xl: 'sm:max-w-4xl',
}

const resolvedLabelledBy = computed(() => (
    props.labelledBy ?? (props.title && !slots.header ? titleId : undefined)
))

const resolvedDescribedBy = computed(() => (
    props.describedBy ?? (props.description && !slots.header ? descriptionId : undefined)
))

const showHeader = computed(() => (
    Boolean(props.title || props.description || slots.header || !props.hideClose)
))

function requestClose(reason?: 'overlay' | 'escape' | 'close') {
    if (!open.value) return
    const source = reason === 'overlay' || reason === 'escape' ? reason : 'close'
    open.value = false
    emit('close', source)
}

function onOverlayClick() {
    if (props.closeOnOverlay) requestClose('overlay')
}

function getFocusable() {
    const root = panelRef.value
    if (!root) return []
    return [...root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter((el) => {
        return !el.hasAttribute('disabled') && el.tabIndex !== -1 && el.getClientRects().length > 0
    })
}

function focusInitial() {
    const root = panelRef.value
    if (!root) return
    const preferred = root.querySelector<HTMLElement>('[data-autofocus]')
    const target = preferred?.matches(FOCUSABLE_SELECTOR)
        ? preferred
        : preferred?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
    ;(target ?? root).focus()
}

function trapFocus(event: KeyboardEvent) {
    const root = panelRef.value
    if (!root) return

    const focusable = getFocusable()
    if (focusable.length === 0) {
        event.preventDefault()
        root.focus()
        return
    }

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const current = document.activeElement
    const inside = current instanceof Node && root.contains(current)

    if (event.shiftKey) {
        if (!inside || current === first || current === root) {
            event.preventDefault()
            last?.focus()
        }
        return
    }

    if (!inside || current === last || current === root) {
        event.preventDefault()
        first?.focus()
    }
}

function onWindowKeydown(event: KeyboardEvent) {
    if (modalStack.at(-1) !== uid) return
    if (document.querySelector('[data-ui-popup]')) return

    if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        if (props.closeOnEscape) requestClose('escape')
        return
    }

    if (event.key === 'Tab') trapFocus(event)
}

function activate() {
    if (active) return
    active = true
    modalStack.push(uid)
    previouslyFocused = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    lockBodyScroll()
    window.addEventListener('keydown', onWindowKeydown, true)
    nextTick(() => {
        requestAnimationFrame(() => {
            if (active) focusInitial()
        })
    })
}

function deactivate() {
    if (!active) return
    active = false
    const index = modalStack.lastIndexOf(uid)
    if (index !== -1) modalStack.splice(index, 1)
    unlockBodyScroll()
    window.removeEventListener('keydown', onWindowKeydown, true)
    const target = previouslyFocused
    previouslyFocused = null
    if (target?.isConnected) target.focus()
}

watch(open, (isOpen) => {
    if (!import.meta.client) return
    if (isOpen) activate()
    else deactivate()
}, { flush: 'post', immediate: true })

onBeforeUnmount(() => {
    if (!import.meta.client) return
    deactivate()
})
</script>

<template>
    <Teleport to="body">
        <Transition name="ui-modal">
            <div
                v-if="open"
                class="fixed inset-0"
                :class="[
                    elevated ? 'z-[90]' : 'z-[80]',
                    placement === 'center' && 'ui-modal-center',
                ]"
            >
                <div
                    class="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
                    @click="onOverlayClick"
                />

                <div
                    class="pointer-events-none relative flex h-full justify-center"
                    :class="placement === 'center' ? 'items-center p-4 sm:p-6' : 'items-end p-3 sm:items-center sm:p-6'"
                >
                    <div
                        ref="panelRef"
                        v-bind="$attrs"
                        class="ui-modal-panel pointer-events-auto flex max-h-[min(92dvh,100%)] w-full flex-col overflow-hidden rounded-[28px] bg-surface text-neutral-900 antialiased shadow-2xl shadow-black/20 outline-none"
                        :class="sizeClass[size]"
                        :role="role"
                        aria-modal="true"
                        tabindex="-1"
                        :aria-labelledby="resolvedLabelledBy"
                        :aria-describedby="resolvedDescribedBy"
                        :aria-label="resolvedLabelledBy ? undefined : ariaLabel"
                    >
                        <header
                            v-if="showHeader"
                            class="flex items-start justify-between gap-4 px-6 pt-6 sm:px-8 sm:pt-8"
                            :class="$slots.default ? '' : 'pb-6 sm:pb-8'"
                        >
                            <div class="min-w-0 flex-1">
                                <slot name="header" :close="requestClose">
                                    <h2
                                        v-if="title"
                                        :id="titleId"
                                        class="text-xl font-semibold tracking-tight text-neutral-950"
                                    >
                                        {{ title }}
                                    </h2>
                                    <p
                                        v-if="description"
                                        :id="descriptionId"
                                        class="mt-1.5 text-sm leading-relaxed text-neutral-500"
                                    >
                                        {{ description }}
                                    </p>
                                </slot>
                            </div>

                            <button
                                v-if="!hideClose"
                                type="button"
                                class="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
                                :aria-label="closeLabel"
                                @click="requestClose"
                            >
                                <i class="fa-solid fa-xmark" aria-hidden="true" />
                            </button>
                        </header>

                        <div
                            v-if="$slots.default"
                            class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5 sm:px-8"
                        >
                            <slot :close="requestClose" />
                        </div>

                        <footer
                            v-if="$slots.footer"
                            class="flex flex-wrap items-center justify-end gap-3 border-t border-neutral-100 px-6 py-4 sm:px-8"
                        >
                            <slot name="footer" :close="requestClose" />
                        </footer>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.ui-modal-enter-active,
.ui-modal-leave-active {
    transition: opacity 180ms ease;
}

.ui-modal-enter-active .ui-modal-panel,
.ui-modal-leave-active .ui-modal-panel {
    transition: transform 180ms ease, opacity 180ms ease;
}

.ui-modal-enter-from,
.ui-modal-leave-to {
    opacity: 0;
}

.ui-modal-enter-from .ui-modal-panel,
.ui-modal-leave-to .ui-modal-panel {
    opacity: 0;
    transform: translateY(0.75rem) scale(0.98);
}

@media (min-width: 640px) {
    .ui-modal-enter-from .ui-modal-panel,
    .ui-modal-leave-to .ui-modal-panel {
        transform: translateY(0) scale(0.98);
    }
}

.ui-modal-center.ui-modal-enter-from .ui-modal-panel,
.ui-modal-center.ui-modal-leave-to .ui-modal-panel {
    transform: scale(0.96);
}

@media (prefers-reduced-motion: reduce) {
    .ui-modal-enter-active,
    .ui-modal-leave-active,
    .ui-modal-enter-active .ui-modal-panel,
    .ui-modal-leave-active .ui-modal-panel {
        transition: none;
    }
}
</style>
