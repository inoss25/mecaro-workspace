<script setup lang="ts">
type PageToken =
    | { type: 'page', value: number }
    | { type: 'ellipsis', id: 'start' | 'end' }

const page = defineModel<number>('page', { default: 1 })
const pageSize = defineModel<number>('pageSize', { default: 10 })

const props = withDefaults(defineProps<{
    total: number
    pageSizeOptions?: number[]
    siblingCount?: number
    disabled?: boolean
    loading?: boolean
    showPageSize?: boolean
    showSummary?: boolean
}>(), {
    pageSizeOptions: () => [10, 25, 50],
    siblingCount: 1,
    disabled: false,
    loading: false,
    showPageSize: true,
    showSummary: true,
})

const numberFormat = new Intl.NumberFormat('fr-FR')

const isLocked = computed(() => props.disabled || props.loading)

const safePageSize = computed(() => {
    const size = Math.floor(Number(pageSize.value))
    return Number.isFinite(size) && size > 0 ? size : 10
})

const totalPages = computed(() => {
    if (props.total <= 0) return 1
    return Math.max(1, Math.ceil(props.total / safePageSize.value))
})

const currentPage = computed(() => {
    const value = Math.floor(Number(page.value))
    if (!Number.isFinite(value) || value < 1) return 1
    return Math.min(value, totalPages.value)
})

const rangeStart = computed(() => {
    if (props.total <= 0) return 0
    return (currentPage.value - 1) * safePageSize.value + 1
})

const rangeEnd = computed(() => {
    if (props.total <= 0) return 0
    return Math.min(currentPage.value * safePageSize.value, props.total)
})

const sizes = computed(() => {
    const values = props.pageSizeOptions
        .map(size => Math.floor(Number(size)))
        .filter(size => Number.isFinite(size) && size > 0)
    return [...new Set([...values, safePageSize.value])].sort((a, b) => a - b)
})

const pages = computed<PageToken[]>(() => {
    const total = totalPages.value
    const current = currentPage.value
    const sibling = Math.max(0, props.siblingCount)
    const maxVisible = sibling * 2 + 5

    if (total <= maxVisible) {
        return range(1, total).map(value => ({ type: 'page', value }))
    }

    const left = Math.max(current - sibling, 1)
    const right = Math.min(current + sibling, total)
    const showLeft = left > 2
    const showRight = right < total - 1
    const edgeCount = 3 + sibling * 2

    if (!showLeft && showRight) {
        return [
            ...range(1, edgeCount).map(value => ({ type: 'page' as const, value })),
            { type: 'ellipsis' as const, id: 'end' as const },
            { type: 'page' as const, value: total },
        ]
    }

    if (showLeft && !showRight) {
        return [
            { type: 'page' as const, value: 1 },
            { type: 'ellipsis' as const, id: 'start' as const },
            ...range(total - edgeCount + 1, total).map(value => ({ type: 'page' as const, value })),
        ]
    }

    return [
        { type: 'page' as const, value: 1 },
        { type: 'ellipsis' as const, id: 'start' as const },
        ...range(left, right).map(value => ({ type: 'page' as const, value })),
        { type: 'ellipsis' as const, id: 'end' as const },
        { type: 'page' as const, value: total },
    ]
})

const canPrevious = computed(() => !isLocked.value && currentPage.value > 1 && props.total > 0)
const canNext = computed(() => !isLocked.value && currentPage.value < totalPages.value && props.total > 0)

const pageSizeModel = computed({
    get: () => safePageSize.value,
    set: (value: number) => {
        const next = Math.floor(Number(value))
        if (!Number.isFinite(next) || next <= 0 || next === pageSize.value) return
        pageSize.value = next
        if (page.value !== 1) page.value = 1
    },
})

watch([page, totalPages], () => {
    const next = currentPage.value
    if (page.value !== next) page.value = next
}, { immediate: true })

function range(start: number, end: number) {
    const length = end - start + 1
    if (length <= 0) return []
    return Array.from({ length }, (_, index) => start + index)
}

function formatCount(value: number) {
    return numberFormat.format(value)
}

function goTo(next: number) {
    if (isLocked.value || props.total <= 0) return
    const clamped = Math.min(Math.max(1, Math.floor(next)), totalPages.value)
    if (clamped === page.value) return
    page.value = clamped
}

function tokenKey(token: PageToken) {
    return token.type === 'page' ? `page-${token.value}` : `ellipsis-${token.id}`
}

const controlClass = 'inline-flex size-10 items-center justify-center rounded-full text-sm font-semibold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40'
</script>

<template>
    <nav
        class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
        aria-label="Pagination du tableau"
        :aria-busy="loading || undefined"
    >
        <p
            v-if="showSummary"
            class="shrink-0 whitespace-nowrap text-sm text-neutral-500"
            aria-live="polite"
        >
            <template v-if="total > 0">
                Affichage de
                <span class="font-semibold text-neutral-900">{{ formatCount(rangeStart) }}</span>
                à
                <span class="font-semibold text-neutral-900">{{ formatCount(rangeEnd) }}</span>
                sur
                <span class="font-semibold text-neutral-900">{{ formatCount(total) }}</span>
            </template>
            <template v-else>
                Aucun résultat
            </template>
        </p>

        <div class="flex flex-wrap items-center justify-between gap-3 sm:ml-auto sm:justify-end">
            <label
                v-if="showPageSize"
                class="relative inline-flex h-10 items-center rounded-full bg-neutral-100 pl-4 pr-3 text-sm text-neutral-500 transition-[box-shadow,background-color] focus-within:bg-surface focus-within:ring-2 focus-within:ring-primary/30"
                :class="isLocked && 'opacity-50'"
            >
                <span class="mr-2">Par page</span>
                <select
                    v-model.number="pageSizeModel"
                    :disabled="isLocked"
                    class="appearance-none bg-transparent pr-5 font-semibold text-neutral-900 outline-none disabled:cursor-not-allowed"
                >
                    <option
                        v-for="size in sizes"
                        :key="size"
                        :value="size"
                    >
                        {{ size }}
                    </option>
                </select>
                <i
                    class="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[10px] text-neutral-400"
                    aria-hidden="true"
                />
            </label>

            <div class="flex items-center gap-1">
                <button
                    type="button"
                    :class="controlClass"
                    class="text-neutral-700 hover:bg-neutral-100"
                    aria-label="Page précédente"
                    :disabled="!canPrevious"
                    @click="goTo(currentPage - 1)"
                >
                    <i class="fa-solid fa-chevron-left text-xs" aria-hidden="true" />
                </button>

                <span class="inline-flex h-10 min-w-16 items-center justify-center px-2 text-sm font-semibold tabular-nums text-neutral-900 sm:hidden">
                    {{ currentPage }}
                    <span class="mx-1 font-medium text-neutral-400">/</span>
                    {{ totalPages }}
                </span>

                <div class="hidden items-center gap-1 sm:flex">
                    <template v-for="token in pages" :key="tokenKey(token)">
                        <span
                            v-if="token.type === 'ellipsis'"
                            class="inline-flex size-10 items-center justify-center text-sm text-neutral-400"
                            aria-hidden="true"
                        >
                            …
                        </span>
                        <button
                            v-else
                            type="button"
                            :class="[
                                controlClass,
                                token.value === currentPage
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'text-neutral-700 hover:bg-neutral-100',
                            ]"
                            :aria-label="`Page ${token.value}`"
                            :aria-current="token.value === currentPage ? 'page' : undefined"
                            :disabled="isLocked || total <= 0"
                            @click="goTo(token.value)"
                        >
                            {{ token.value }}
                        </button>
                    </template>
                </div>

                <button
                    type="button"
                    :class="controlClass"
                    class="text-neutral-700 hover:bg-neutral-100"
                    aria-label="Page suivante"
                    :disabled="!canNext"
                    @click="goTo(currentPage + 1)"
                >
                    <i class="fa-solid fa-chevron-right text-xs" aria-hidden="true" />
                </button>
            </div>
        </div>
    </nav>
</template>
