<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const model = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<{
    label?: string
    placeholder?: string
    error?: string
    hint?: string
    icon?: string
    name?: string
    id?: string
    min?: string
    max?: string
    autocomplete?: string
    clearable?: boolean
    disabled?: boolean
    required?: boolean
}>(), {
    placeholder: 'Choisir une date',
    icon: 'fa-regular fa-calendar',
    clearable: true,
    disabled: false,
    required: false,
})

const { locale } = useI18n()
const open = ref(false)
const panel = ref<'days' | 'months' | 'years'>('days')
const anchorRef = ref<HTMLElement | null>(null)
const popupRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const yearListRef = ref<HTMLElement | null>(null)
const generatedId = useId()
const inputId = computed(() => props.id ?? generatedId)
const today = new Date()

const viewYear = ref(today.getFullYear())
const viewMonth = ref(today.getMonth())
const focusedDate = ref(startOfDay(today))

const intlLocale = computed(() => locale.value === 'en' ? 'en-US' : 'fr-FR')
const weekStartsOn = computed(() => intlLocale.value === 'en-US' ? 0 : 1)

const { style } = useAnchoredPopup(anchorRef, popupRef, open, {
    align: 'start',
    width: 312,
})

onClickOutside(popupRef, () => {
    if (open.value) open.value = false
}, { ignore: [anchorRef] })

const selectedDate = computed(() => parseISODate(model.value))

const displayValue = computed(() => {
    const date = selectedDate.value
    if (!date) return ''
    return new Intl.DateTimeFormat(intlLocale.value, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(date)
})

const monthTitle = computed(() => (
    new Intl.DateTimeFormat(intlLocale.value, { month: 'long' }).format(new Date(viewYear.value, viewMonth.value, 1))
))

const monthNames = computed(() => (
    Array.from({ length: 12 }, (_, month) => (
        new Intl.DateTimeFormat(intlLocale.value, { month: 'short' }).format(new Date(2024, month, 1)).replace('.', '')
    ))
))

const weekdayLabels = computed(() => {
    const formatter = new Intl.DateTimeFormat(intlLocale.value, { weekday: 'short' })
    const sunday = new Date(2024, 0, 7)
    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(sunday)
        date.setDate(sunday.getDate() + weekStartsOn.value + index)
        return formatter.format(date).replace('.', '').slice(0, 2)
    })
})

const years = computed(() => {
    const current = today.getFullYear()
    const minYear = props.min ? Number(props.min.slice(0, 4)) : current - 120
    const maxYear = props.max ? Number(props.max.slice(0, 4)) : current + 20
    const start = Math.min(minYear, maxYear)
    const end = Math.max(minYear, maxYear)
    return Array.from({ length: end - start + 1 }, (_, index) => start + index)
})

const days = computed(() => {
    const first = new Date(viewYear.value, viewMonth.value, 1)
    const offset = (first.getDay() - weekStartsOn.value + 7) % 7
    const start = new Date(first)
    start.setDate(1 - offset)
    return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(start)
        date.setDate(start.getDate() + index)
        return date
    })
})

const yearBounds = computed(() => {
    const list = years.value
    return {
        min: list[0] ?? viewYear.value,
        max: list.at(-1) ?? viewYear.value,
    }
})

const canGoPrev = computed(() => {
    if (panel.value === 'days') {
        if (!props.min) return true
        return toISODate(new Date(viewYear.value, viewMonth.value, 1)) > props.min
    }
    return viewYear.value > yearBounds.value.min
})

const canGoNext = computed(() => {
    if (panel.value === 'days') {
        if (!props.max) return true
        return toISODate(new Date(viewYear.value, viewMonth.value + 1, 0)) < props.max
    }
    return viewYear.value < yearBounds.value.max
})

const previousLabel = computed(() => panel.value === 'days' ? 'Mois précédent' : 'Année précédente')
const nextLabel = computed(() => panel.value === 'days' ? 'Mois suivant' : 'Année suivante')

const todayDisabled = computed(() => isOutOfRange(startOfDay(today)))

function startOfDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function parseISODate(value: string) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
    if (!match) return null
    const year = Number(match[1])
    const month = Number(match[2])
    const day = Number(match[3])
    const date = new Date(year, month - 1, day)
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
    return date
}

function toISODate(date: Date) {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${date.getFullYear()}-${month}-${day}`
}

function isSameDay(left: Date, right: Date) {
    return left.getFullYear() === right.getFullYear()
        && left.getMonth() === right.getMonth()
        && left.getDate() === right.getDate()
}

function isOutOfRange(date: Date) {
    const iso = toISODate(date)
    if (props.min && iso < props.min) return true
    if (props.max && iso > props.max) return true
    return false
}

function dayLabel(date: Date) {
    return new Intl.DateTimeFormat(intlLocale.value, { dateStyle: 'long' }).format(date)
}

function show(date = selectedDate.value ?? startOfDay(today)) {
    const next = isOutOfRange(date) ? startOfDay(today) : date
    focusedDate.value = next
    viewYear.value = next.getFullYear()
    viewMonth.value = next.getMonth()
    panel.value = 'days'
}

function toggle() {
    if (props.disabled) return
    open.value = !open.value
    if (open.value) show()
}

function close() {
    open.value = false
    triggerRef.value?.focus()
}

function shiftMonth(delta: number) {
    const next = new Date(viewYear.value, viewMonth.value + delta, 1)
    viewYear.value = next.getFullYear()
    viewMonth.value = next.getMonth()
}

function shiftView(direction: -1 | 1) {
    if (!((direction < 0 && canGoPrev.value) || (direction > 0 && canGoNext.value))) return
    if (panel.value === 'years') {
        viewYear.value = Math.min(
            yearBounds.value.max,
            Math.max(yearBounds.value.min, viewYear.value + direction * 12),
        )
        return
    }
    if (panel.value === 'months') {
        viewYear.value += direction
        return
    }
    shiftMonth(direction)
}

function moveFocus(daysToMove: number) {
    const next = new Date(focusedDate.value)
    next.setDate(next.getDate() + daysToMove)
    if (isOutOfRange(next)) return
    focusedDate.value = next
    viewYear.value = next.getFullYear()
    viewMonth.value = next.getMonth()
}

function selectDate(date: Date) {
    if (props.disabled || isOutOfRange(date)) return
    model.value = toISODate(date)
    close()
}

function selectToday() {
    if (todayDisabled.value) return
    selectDate(startOfDay(today))
}

function clear() {
    model.value = ''
    close()
}

function chooseMonth(month: number) {
    viewMonth.value = month
    panel.value = 'days'
}

function chooseYear(year: number) {
    viewYear.value = year
    panel.value = 'months'
}

function onTriggerKeydown(event: KeyboardEvent) {
    if (props.disabled) return

    if (!open.value) {
        if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            open.value = true
            show()
        }
        return
    }

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

    if (panel.value !== 'days') return

    if (event.key === 'Enter') {
        event.preventDefault()
        selectDate(focusedDate.value)
        return
    }

    if (event.key === ' ') event.preventDefault()

    const moves: Record<string, number> = {
        ArrowLeft: -1,
        ArrowRight: 1,
        ArrowUp: -7,
        ArrowDown: 7,
    }
    if (event.key in moves) {
        event.preventDefault()
        moveFocus(moves[event.key] ?? 0)
        return
    }

    if (event.key === 'PageUp') {
        event.preventDefault()
        shiftMonth(event.shiftKey ? -12 : -1)
    }
    else if (event.key === 'PageDown') {
        event.preventDefault()
        shiftMonth(event.shiftKey ? 12 : 1)
    }
}

watch(panel, (value) => {
    if (value !== 'years') return
    nextTick(() => {
        const current = yearListRef.value?.querySelector<HTMLElement>('[data-current="true"]')
        const list = yearListRef.value
        if (!current || !list) return
        list.scrollTop = current.offsetTop - list.clientHeight / 2 + current.clientHeight / 2
    })
})
</script>

<template>
    <div class="flex w-full flex-col gap-2" v-bind="$attrs">
        <div
            v-if="label || $slots['label-action']"
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
            ref="anchorRef"
            class="flex items-center gap-3 rounded-full bg-neutral-100 px-4 transition-[box-shadow,background-color] duration-150"
            :class="[
                error
                    ? 'ring-2 ring-red-400'
                    : 'focus-within:bg-surface focus-within:ring-2 focus-within:ring-primary/30',
                disabled && 'opacity-60',
            ]"
        >
            <span class="shrink-0 text-neutral-400" aria-hidden="true">
                <slot name="leading">
                    <i :class="icon" />
                </slot>
            </span>

            <button
                :id="inputId"
                ref="triggerRef"
                type="button"
                class="h-12 min-w-0 flex-1 truncate text-left text-sm outline-none disabled:cursor-not-allowed"
                :class="displayValue ? 'text-neutral-900' : 'text-neutral-400'"
                :disabled="disabled"
                :aria-expanded="open"
                aria-haspopup="dialog"
                :aria-invalid="error ? true : undefined"
                :aria-describedby="error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined"
                @click="toggle"
                @keydown="onTriggerKeydown"
            >
                {{ displayValue || placeholder }}
            </button>

            <button
                v-if="clearable && model && !disabled"
                type="button"
                class="shrink-0 p-1 text-neutral-400 transition-colors hover:text-neutral-700"
                aria-label="Effacer la date"
                @click="clear"
            >
                <i class="fa-solid fa-xmark text-xs" aria-hidden="true" />
            </button>

            <input
                type="hidden"
                :name="name"
                :value="model"
                :autocomplete="autocomplete"
                :required="required"
            >
        </div>

        <p
            v-if="error"
            :id="`${inputId}-error`"
            class="text-sm text-red-600"
        >
            {{ error }}
        </p>
        <p
            v-else-if="hint"
            :id="`${inputId}-hint`"
            class="text-sm text-neutral-500"
        >
            {{ hint }}
        </p>
    </div>

    <Teleport to="body">
        <Transition name="ui-popup">
            <div
                v-if="open"
                ref="popupRef"
                data-ui-popup
                class="rounded-3xl bg-surface p-3 text-neutral-900 shadow-xl shadow-black/10 ring-1 ring-neutral-200"
                :style="style"
                role="dialog"
                aria-label="Choisir une date"
            >
                <div class="mb-2 flex items-center justify-between gap-2">
                    <button
                        type="button"
                        class="inline-flex size-8 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800 disabled:cursor-not-allowed disabled:opacity-30"
                        :aria-label="previousLabel"
                        :disabled="!canGoPrev"
                        @click="shiftView(-1)"
                    >
                        <i class="fa-solid fa-chevron-left text-xs" aria-hidden="true" />
                    </button>

                    <div class="flex min-w-0 items-center gap-1">
                        <button
                            type="button"
                            class="rounded-full px-2.5 py-1 text-sm font-semibold capitalize tracking-tight text-neutral-950 hover:bg-neutral-100"
                            @click="panel = panel === 'months' ? 'days' : 'months'"
                        >
                            {{ monthTitle }}
                        </button>
                        <button
                            type="button"
                            class="rounded-full px-2.5 py-1 text-sm font-semibold tracking-tight text-neutral-950 hover:bg-neutral-100"
                            @click="panel = panel === 'years' ? 'days' : 'years'"
                        >
                            {{ viewYear }}
                        </button>
                    </div>

                    <button
                        type="button"
                        class="inline-flex size-8 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800 disabled:cursor-not-allowed disabled:opacity-30"
                        :aria-label="nextLabel"
                        :disabled="!canGoNext"
                        @click="shiftView(1)"
                    >
                        <i class="fa-solid fa-chevron-right text-xs" aria-hidden="true" />
                    </button>
                </div>

                <div v-if="panel === 'months'" class="grid grid-cols-3 gap-1">
                    <button
                        v-for="(name, index) in monthNames"
                        :key="name"
                        type="button"
                        class="h-10 rounded-xl text-sm font-medium capitalize transition-colors"
                        :class="index === viewMonth
                            ? 'bg-primary text-white'
                            : 'text-neutral-700 hover:bg-neutral-100'"
                        @click="chooseMonth(index)"
                    >
                        {{ name }}
                    </button>
                </div>

                <div
                    v-else-if="panel === 'years'"
                    ref="yearListRef"
                    class="relative grid max-h-56 grid-cols-4 gap-1 overflow-y-auto"
                >
                    <button
                        v-for="year in years"
                        :key="year"
                        type="button"
                        class="h-10 rounded-xl text-sm font-medium transition-colors"
                        :class="year === viewYear
                            ? 'bg-primary text-white'
                            : 'text-neutral-700 hover:bg-neutral-100'"
                        :data-current="year === viewYear ? 'true' : undefined"
                        @click="chooseYear(year)"
                    >
                        {{ year }}
                    </button>
                </div>

                <template v-else>
                    <div class="mb-1 grid grid-cols-7 gap-1">
                        <span
                            v-for="label in weekdayLabels"
                            :key="label"
                            class="flex h-8 items-center justify-center text-[11px] font-semibold uppercase tracking-wide text-neutral-400"
                        >
                            {{ label }}
                        </span>
                    </div>

                    <div class="grid grid-cols-7 gap-1">
                        <button
                            v-for="date in days"
                            :key="toISODate(date)"
                            type="button"
                            class="flex size-9 items-center justify-center rounded-full text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-30"
                            :class="[
                                isSameDay(date, selectedDate ?? new Date(0))
                                    ? 'bg-primary font-semibold text-white'
                                    : isSameDay(date, focusedDate)
                                        ? 'bg-primary/10 font-semibold text-primary'
                                        : date.getMonth() === viewMonth
                                            ? 'text-neutral-800 hover:bg-neutral-100'
                                            : 'text-neutral-300 hover:bg-neutral-50',
                                isSameDay(date, today) && !isSameDay(date, selectedDate ?? new Date(0)) && 'ring-1 ring-primary/40',
                            ]"
                            :disabled="isOutOfRange(date)"
                            :aria-pressed="selectedDate ? isSameDay(date, selectedDate) : undefined"
                            :aria-label="dayLabel(date)"
                            @click="selectDate(date)"
                        >
                            {{ date.getDate() }}
                        </button>
                    </div>
                </template>

                <div class="mt-2 flex items-center justify-between border-t border-neutral-100 pt-2">
                    <button
                        type="button"
                        class="rounded-full px-3 py-1.5 text-sm font-semibold text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
                        :disabled="!model"
                        @click="clear"
                    >
                        Effacer
                    </button>
                    <button
                        type="button"
                        class="rounded-full px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
                        :disabled="todayDisabled"
                        @click="selectToday"
                    >
                        Aujourd'hui
                    </button>
                </div>
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
