<script lang="ts">
export interface TableColumn {
    key: string
    label: string
    align?: 'left' | 'center' | 'right'
    width?: string
    wrap?: boolean
    cellClass?: string
}
</script>

<script setup lang="ts" generic="T extends Record<string, any>">
const page = defineModel<number>('page', { default: 1 })
const pageSize = defineModel<number>('pageSize', { default: 10 })
const search = defineModel<string>('search', { default: '' })
const hiddenColumns = defineModel<string[]>('hiddenColumns', { default: () => [] })

const props = withDefaults(defineProps<{
    columns: TableColumn[]
    rows: T[]
    rowKey?: string | ((row: T) => string | number)
    loading?: boolean
    paginated?: boolean
    searchable?: boolean
    columnToggle?: boolean
    total?: number
    pageSizeOptions?: number[]
    label?: string
    searchPlaceholder?: string
    emptyTitle?: string
    emptyText?: string
    clickable?: boolean
}>(), {
    rowKey: 'id',
    loading: false,
    paginated: true,
    searchable: true,
    columnToggle: true,
    pageSizeOptions: () => [10, 25, 50],
    label: 'Tableau',
    searchPlaceholder: 'Rechercher',
    emptyTitle: 'Aucun résultat',
    emptyText: 'Il n’y a rien à afficher pour le moment.',
    clickable: false,
})

const emit = defineEmits<{
    rowClick: [row: T]
}>()

const slots = useSlots()
const columnsOpen = ref(false)
const columnsMenuRef = ref<HTMLElement | null>(null)
const columnsMenuId = useId()
const hasActions = computed(() => Boolean(slots.actions))
const serverPaged = computed(() => props.total != null)
const hasToolbarSlot = computed(() => Boolean(slots.toolbar || slots['toolbar-start'] || slots['toolbar-end']))
const showToolbar = computed(() => props.searchable || props.columnToggle || hasToolbarSlot.value)

const visibleColumns = computed(() => {
    const visible = props.columns.filter(column => !hiddenColumns.value.includes(column.key))
    return visible.length > 0 ? visible : props.columns.slice(0, 1)
})

const columnCount = computed(() => Math.max(1, visibleColumns.value.length + (hasActions.value ? 1 : 0)))

const query = computed(() => search.value.trim().toLocaleLowerCase('fr'))

const filteredRows = computed(() => {
    if (!query.value || serverPaged.value) return props.rows
    return props.rows.filter(row =>
        props.columns.some(column => cellText(cellValue(row, column.key)).includes(query.value)),
    )
})

const totalCount = computed(() => serverPaged.value ? (props.total ?? 0) : filteredRows.value.length)

const emptyTitleText = computed(() => query.value ? 'Aucun résultat' : props.emptyTitle)
const emptyBodyText = computed(() => {
    if (!query.value) return props.emptyText
    return `Aucun élément ne correspond à « ${search.value.trim()} ».`
})

const safeSize = computed(() => {
    const size = Math.floor(Number(pageSize.value))
    return Number.isFinite(size) && size > 0 ? size : 10
})

const safePage = computed(() => {
    const pages = Math.max(1, Math.ceil(totalCount.value / safeSize.value) || 1)
    const value = Math.floor(Number(page.value))
    if (!Number.isFinite(value) || value < 1) return 1
    return Math.min(value, pages)
})

const pageRows = computed(() => {
    if (serverPaged.value) return props.rows
    if (!props.paginated) return filteredRows.value
    const start = (safePage.value - 1) * safeSize.value
    return filteredRows.value.slice(start, start + safeSize.value)
})

const showSkeleton = computed(() => props.loading && pageRows.value.length === 0)

watch(search, () => {
    if (page.value !== 1) page.value = 1
})

onClickOutside(columnsMenuRef, () => {
    columnsOpen.value = false
})

function cellText(value: unknown) {
    if (typeof value === 'boolean') return value ? 'oui' : 'non'
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint') {
        return String(value).toLocaleLowerCase('fr')
    }
    return ''
}

function isColumnVisible(key: string) {
    return visibleColumns.value.some(column => column.key === key)
}

function toggleColumn(key: string) {
    const hidden = new Set(hiddenColumns.value)
    if (hidden.has(key)) {
        hidden.delete(key)
        hiddenColumns.value = [...hidden]
        return
    }
    if (visibleColumns.value.length <= 1) return
    hidden.add(key)
    hiddenColumns.value = [...hidden]
}

function alignClass(align?: TableColumn['align']) {
    if (align === 'center') return 'text-center'
    if (align === 'right') return 'text-right'
    return 'text-left'
}

function cellValue(row: T, key: string) {
    return key.split('.').reduce<unknown>((current, part) => {
        if (current == null || typeof current !== 'object') return undefined
        return (current as Record<string, unknown>)[part]
    }, row)
}

function rowKeyOf(row: T, index: number) {
    if (typeof props.rowKey === 'function') return props.rowKey(row)
    const value = row[props.rowKey]
    if (value == null || value === '') return `row-${index}`
    return String(value)
}

function isEmpty(value: unknown) {
    return value == null || value === ''
}

function onRowClick(row: T) {
    if (!props.clickable) return
    emit('rowClick', row)
}

function onRowKeydown(event: KeyboardEvent, row: T) {
    if (!props.clickable || (event.key !== 'Enter' && event.key !== ' ')) return
    event.preventDefault()
    emit('rowClick', row)
}
</script>

<template>
    <section
        class="rounded-[28px] bg-surface shadow-sm"
        :aria-busy="loading || undefined"
    >
        <div
            v-if="showToolbar"
            class="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-5"
        >
            <label
                v-if="searchable"
                class="flex h-10 min-w-0 flex-1 items-center gap-2.5 rounded-full bg-neutral-100 px-4 transition-[box-shadow,background-color] focus-within:bg-surface focus-within:ring-2 focus-within:ring-primary/30 sm:max-w-sm"
            >
                <i class="fa-solid fa-magnifying-glass shrink-0 text-sm text-neutral-400" aria-hidden="true" />
                <input
                    v-model="search"
                    type="text"
                    :placeholder="searchPlaceholder"
                    :disabled="loading"
                    autocomplete="off"
                    aria-label="Rechercher dans le tableau"
                    class="h-10 min-w-0 flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400 disabled:cursor-not-allowed"
                >
                <button
                    v-if="search"
                    type="button"
                    class="shrink-0 text-neutral-400 transition-colors hover:text-neutral-600"
                    aria-label="Effacer la recherche"
                    @click="search = ''"
                >
                    <i class="fa-solid fa-xmark text-sm" aria-hidden="true" />
                </button>
            </label>

            <div
                v-if="columnToggle || hasToolbarSlot"
                class="flex flex-wrap items-center justify-end gap-2 sm:ml-auto"
            >
                <slot name="toolbar-start" />
                <slot name="toolbar" />

                <div v-if="columnToggle" ref="columnsMenuRef" class="relative">
                    <button
                        type="button"
                        class="inline-flex h-10 items-center gap-2 rounded-full bg-neutral-100 px-4 text-sm font-semibold text-neutral-700 transition-[box-shadow,background-color] hover:bg-neutral-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        :class="columnsOpen && 'bg-surface ring-2 ring-primary/30'"
                        :aria-expanded="columnsOpen"
                        aria-haspopup="true"
                        :aria-controls="columnsMenuId"
                        :disabled="loading"
                        @click="columnsOpen = !columnsOpen"
                        @keydown.escape="columnsOpen = false"
                    >
                        <i class="fa-solid fa-table-columns text-xs text-neutral-500" aria-hidden="true" />
                        Colonnes
                        <span
                            v-if="hiddenColumns.length"
                            class="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-white"
                        >
                            {{ visibleColumns.length }}
                        </span>
                        <i
                            class="fa-solid fa-chevron-down text-[10px] text-neutral-400 transition-transform"
                            :class="columnsOpen && 'rotate-180'"
                            aria-hidden="true"
                        />
                    </button>

                    <div
                        v-if="columnsOpen"
                        :id="columnsMenuId"
                        class="absolute right-0 z-20 mt-2 w-60 rounded-2xl bg-surface p-1.5 shadow-lg ring-1 ring-neutral-200"
                        role="group"
                        aria-label="Colonnes affichées"
                        @keydown.escape="columnsOpen = false"
                    >
                        <label
                            v-for="column in columns"
                            :key="column.key"
                            class="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-50"
                            :class="isColumnVisible(column.key) && visibleColumns.length === 1 && 'cursor-not-allowed opacity-60'"
                        >
                            <input
                                type="checkbox"
                                class="size-4 rounded border-neutral-300 accent-primary"
                                :checked="isColumnVisible(column.key)"
                                :disabled="isColumnVisible(column.key) && visibleColumns.length === 1"
                                @change="toggleColumn(column.key)"
                            >
                            <span class="min-w-0 flex-1 truncate">{{ column.label }}</span>
                        </label>
                    </div>
                </div>

                <slot name="toolbar-end" />
            </div>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full min-w-full border-collapse text-left" :aria-label="label">
                <thead class="bg-neutral-50">
                    <tr class="border-b border-neutral-100">
                        <th
                            v-for="column in visibleColumns"
                            :key="column.key"
                            scope="col"
                            class="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400"
                            :class="[alignClass(column.align), !column.wrap && 'whitespace-nowrap']"
                            :style="column.width ? { width: column.width } : undefined"
                        >
                            <slot :name="`header-${column.key}`" :column="column">
                                {{ column.label }}
                            </slot>
                        </th>
                        <th v-if="hasActions" scope="col" class="px-5 py-3.5 text-right">
                            <span class="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>

                <tbody v-if="showSkeleton">
                    <tr
                        v-for="index in 5"
                        :key="`skeleton-${index}`"
                        class="border-b border-neutral-100 last:border-b-0"
                    >
                        <td
                            v-for="column in visibleColumns"
                            :key="column.key"
                            class="px-5 py-4"
                        >
                            <span
                                class="block h-3.5 animate-pulse rounded-full bg-neutral-100"
                                :class="index % 2 === 0 ? 'w-1/2' : 'w-2/3'"
                            />
                        </td>
                        <td v-if="hasActions" class="px-5 py-4">
                            <span class="ml-auto block h-3.5 w-16 animate-pulse rounded-full bg-neutral-100" />
                        </td>
                    </tr>
                </tbody>

                <tbody v-else-if="pageRows.length === 0">
                    <tr>
                        <td :colspan="columnCount" class="px-5 py-16 text-center">
                            <slot name="empty">
                                <span class="mx-auto flex size-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
                                    <i class="fa-regular fa-folder-open" aria-hidden="true" />
                                </span>
                                <p class="mt-4 text-sm font-semibold text-neutral-900">
                                    {{ emptyTitleText }}
                                </p>
                                <p class="mt-1 text-sm text-neutral-500">
                                    {{ emptyBodyText }}
                                </p>
                            </slot>
                        </td>
                    </tr>
                </tbody>

                <tbody v-else :class="loading && 'pointer-events-none opacity-60'">
                    <tr
                        v-for="(row, index) in pageRows"
                        :key="rowKeyOf(row, (safePage - 1) * safeSize + index)"
                        class="border-b border-neutral-100 transition-colors last:border-b-0 hover:bg-neutral-50"
                        :class="clickable && 'cursor-pointer focus-visible:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary/40'"
                        :tabindex="clickable ? 0 : undefined"
                        @click="onRowClick(row)"
                        @keydown="onRowKeydown($event, row)"
                    >
                        <td
                            v-for="column in visibleColumns"
                            :key="column.key"
                            class="px-5 py-4 text-sm text-neutral-800"
                            :class="[
                                alignClass(column.align),
                                !column.wrap && 'whitespace-nowrap',
                                column.cellClass,
                            ]"
                        >
                            <slot
                                :name="`cell-${column.key}`"
                                :row="row"
                                :value="cellValue(row, column.key)"
                                :column="column"
                                :index="index"
                            >
                                <span
                                    v-if="typeof cellValue(row, column.key) === 'boolean'"
                                    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                                    :class="cellValue(row, column.key)
                                        ? 'bg-primary/10 text-primary'
                                        : 'bg-neutral-100 text-neutral-500'"
                                >
                                    <span
                                        class="size-1.5 rounded-full"
                                        :class="cellValue(row, column.key) ? 'bg-primary' : 'bg-neutral-400'"
                                        aria-hidden="true"
                                    />
                                    {{ cellValue(row, column.key) ? 'Oui' : 'Non' }}
                                </span>
                                <span v-else-if="isEmpty(cellValue(row, column.key))" class="text-neutral-300">—</span>
                                <template v-else>
                                    {{ cellValue(row, column.key) }}
                                </template>
                            </slot>
                        </td>
                        <td v-if="hasActions" class="px-5 py-3 text-right whitespace-nowrap">
                            <div class="inline-flex items-center justify-end gap-1" @click.stop>
                                <slot name="actions" :row="row" :index="index" />
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div
            v-if="paginated && totalCount > 0"
            class="border-t border-neutral-100 px-5 py-4"
        >
            <UiTablePagination
                v-model:page="page"
                v-model:page-size="pageSize"
                :total="totalCount"
                :page-size-options="pageSizeOptions"
                :loading="loading"
            />
        </div>
    </section>
</template>
