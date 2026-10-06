<script setup lang="ts">
defineOptions({ inheritAttrs: false })

export type DropdownItem = {
    id?: string | number
    label: string
    icon?: string
    to?: string
    disabled?: boolean
    danger?: boolean
}

const open = defineModel<boolean>({ default: false })

const props = withDefaults(defineProps<{
    items?: DropdownItem[]
    label?: string
    align?: 'start' | 'end'
}>(), {
    items: () => [],
    label: 'Ouvrir le menu',
    align: 'end',
})

const emit = defineEmits<{
    select: [item: DropdownItem]
}>()

const anchorRef = ref<HTMLElement | null>(null)
const popupRef = ref<HTMLElement | null>(null)
const slots = useSlots()

const { style } = useAnchoredPopup(anchorRef, popupRef, open, {
    align: () => props.align,
    minWidth: 'anchor',
})

const hasMenu = computed(() => Boolean(slots.default) || props.items.length > 0)

onClickOutside(popupRef, () => {
    if (open.value) open.value = false
}, { ignore: [anchorRef] })

function toggle() {
    if (!hasMenu.value) return
    open.value = !open.value
}

function close() {
    open.value = false
    nextTick(focusTrigger)
}

function focusTrigger() {
    anchorRef.value?.querySelector<HTMLElement>('button, a, [tabindex]')?.focus()
}

function choose(item: DropdownItem) {
    if (item.disabled) return
    open.value = false
    emit('select', item)
    nextTick(focusTrigger)
}

function menuItems() {
    const root = popupRef.value
    if (!root) return []
    return [...root.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])')]
}

function onMenuKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        close()
        return
    }

    if (event.key === 'Tab') {
        open.value = false
        return
    }

    const items = menuItems()
    if (!items.length) return
    const index = items.findIndex(item => item === document.activeElement)

    if (event.key === 'ArrowDown') {
        event.preventDefault()
        items[(index + 1) % items.length]?.focus()
    }
    else if (event.key === 'ArrowUp') {
        event.preventDefault()
        items[(index - 1 + items.length) % items.length]?.focus()
    }
    else if (event.key === 'Home') {
        event.preventDefault()
        items[0]?.focus()
    }
    else if (event.key === 'End') {
        event.preventDefault()
        items.at(-1)?.focus()
    }
}

watch(open, (isOpen) => {
    if (!isOpen) return
    nextTick(() => {
        menuItems()[0]?.focus()
    })
})
</script>

<template>
    <div ref="anchorRef" class="inline-flex" v-bind="$attrs">
        <slot
            name="trigger"
            :open="open"
            :toggle="toggle"
            :close="close"
        >
            <button
                type="button"
                class="inline-flex size-10 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                :aria-label="label"
                aria-haspopup="menu"
                :aria-expanded="open"
                @click="toggle"
            >
                <i class="fa-solid fa-ellipsis" aria-hidden="true" />
            </button>
        </slot>
    </div>

    <Teleport to="body">
        <Transition name="ui-popup">
            <div
                v-if="open"
                ref="popupRef"
                data-ui-popup
                class="w-max rounded-2xl bg-surface p-1.5 text-neutral-900 shadow-lg shadow-black/10 ring-1 ring-neutral-200"
                :style="style"
                role="menu"
                @keydown="onMenuKeydown"
            >
                <slot :close="close">
                    <template v-for="(item, index) in items" :key="item.id ?? `${item.label}-${index}`">
                        <NuxtLink
                            v-if="item.to && !item.disabled"
                            :to="item.to"
                            role="menuitem"
                            tabindex="-1"
                            class="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                            :class="item.danger && 'text-red-600 hover:bg-red-500/10'"
                            @click="choose(item)"
                        >
                            <i
                                v-if="item.icon"
                                :class="item.icon"
                                class="w-4 text-center text-neutral-400"
                                aria-hidden="true"
                            />
                            {{ item.label }}
                        </NuxtLink>
                        <button
                            v-else
                            type="button"
                            role="menuitem"
                            tabindex="-1"
                            class="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
                            :class="item.danger && 'text-red-600 hover:bg-red-500/10'"
                            :disabled="item.disabled"
                            @click="choose(item)"
                        >
                            <i
                                v-if="item.icon"
                                :class="[item.icon, item.danger ? 'text-red-500' : 'text-neutral-400']"
                                class="w-4 text-center"
                                aria-hidden="true"
                            />
                            {{ item.label }}
                        </button>
                    </template>
                </slot>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.ui-popup-enter-active,
.ui-popup-leave-active {
    transition: opacity 120ms ease, transform 120ms ease;
}

.ui-popup-enter-from,
.ui-popup-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
    .ui-popup-enter-active,
    .ui-popup-leave-active {
        transition: none;
    }
}
</style>
