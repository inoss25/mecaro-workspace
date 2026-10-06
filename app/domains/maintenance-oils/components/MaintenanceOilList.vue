<script setup lang="ts">
import { maintenanceRecordLabel, formatMoney } from '../../maintenance-records/utils/options'
import { useMaintenanceOilStore } from '../stores/maintenanceOilStore'
import type { MaintenanceOil } from '../types'
import { formatOilQuantity, MAINTENANCE_OIL_ORDER_OPTIONS, type MaintenanceOilOrderKey } from '../utils/options'

const emit = defineEmits<{
    edit: [oil: MaintenanceOil]
}>()

const columns = [
    { key: 'record', label: 'Intervention' },
    { key: 'product_name', label: 'Produit' },
    { key: 'viscosity', label: 'Viscosité' },
    { key: 'quantity', label: 'Quantité' },
    { key: 'total_price', label: 'Montant' },
]

const store = useMaintenanceOilStore()
const alert = useAlert()
const toast = useToast()

const searchInput = ref(store.search)
const deletingId = ref<string | null>(null)
const rows = computed(() => store.items)
const errorMessage = computed(() => store.error ? extractErrorMessage(store.error) : '')

const pageModel = computed({
    get: () => store.page,
    set: (value: number) => { void store.setPage(value) },
})

const pageSizeModel = computed({
    get: () => store.perPage,
    set: (value: number) => { void store.setPerPage(value) },
})

watchDebounced(searchInput, (value) => {
    void store.applySearch(value)
}, { debounce: 300 })

onMounted(() => {
    void store.fetchPage()
    void store.fetchRecords()
})

function onRecordChange(event: Event) {
    void store.applyRecord((event.target as HTMLSelectElement).value)
}

function onOrderChange(event: Event) {
    void store.applyOrder((event.target as HTMLSelectElement).value as MaintenanceOilOrderKey)
}

function oilLabel(oil: MaintenanceOil) {
    return oil.product_name?.trim() || oil.brand?.trim() || 'Huile'
}

async function onDelete(oil: MaintenanceOil) {
    if (deletingId.value) return
    const result = await alert.confirm({
        title: 'Supprimer cette huile ?',
        text: `${oilLabel(oil)} sera retirée.`,
        confirmText: 'Supprimer',
    })
    if (!result.isConfirmed) return

    deletingId.value = oil.id
    const deleted = await store.remove(oil.id)
    deletingId.value = null
    if (!deleted) {
        toast.error('Suppression impossible', store.mutationError ? extractErrorMessage(store.mutationError) : undefined)
        return
    }
    toast.success('Huile supprimée', `${oilLabel(oil)} a été retirée.`)
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <p v-if="errorMessage" class="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            <span>{{ errorMessage }}</span>
            <button type="button" class="font-semibold text-red-800 underline-offset-2 hover:underline" @click="store.fetchPage()">Réessayer</button>
        </p>

        <UiTable
            v-model:page="pageModel"
            v-model:page-size="pageSizeModel"
            v-model:search="searchInput"
            :columns="columns"
            :rows="rows"
            :loading="store.loading"
            :total="store.total"
            label="Huiles"
            search-placeholder="Rechercher une huile"
            :empty-title="errorMessage ? 'Chargement impossible' : 'Aucune huile'"
            :empty-text="errorMessage ? 'La liste n’a pas pu être récupérée.' : 'Ajoutez une huile à une intervention.'"
        >
            <template #toolbar-start>
                <label class="relative inline-flex h-10 items-center rounded-full bg-neutral-100 pl-4 pr-3 text-sm text-neutral-500">
                    <span class="mr-2">Intervention</span>
                    <select
                        :value="store.recordId"
                        :disabled="store.loading || store.optionsLoading || !!store.fixedRecordId"
                        class="max-w-44 appearance-none truncate bg-transparent pr-5 font-semibold text-neutral-900 outline-none disabled:cursor-not-allowed"
                        aria-label="Filtrer par intervention"
                        @change="onRecordChange"
                    >
                        <option value="">Toutes</option>
                        <option v-for="record in store.records" :key="record.id" :value="record.id">
                            {{ maintenanceRecordLabel(record) }}
                        </option>
                    </select>
                    <i class="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[10px] text-neutral-400" aria-hidden="true" />
                </label>
                <label class="relative inline-flex h-10 items-center rounded-full bg-neutral-100 pl-4 pr-3 text-sm text-neutral-500">
                    <span class="mr-2">Tri</span>
                    <select :value="store.orderKey" :disabled="store.loading" class="appearance-none bg-transparent pr-5 font-semibold text-neutral-900 outline-none disabled:cursor-not-allowed" aria-label="Trier les huiles" @change="onOrderChange">
                        <option v-for="option in MAINTENANCE_OIL_ORDER_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</option>
                    </select>
                    <i class="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[10px] text-neutral-400" aria-hidden="true" />
                </label>
            </template>

            <template #cell-record="{ row }">
                {{ maintenanceRecordLabel(row.maintenance_record) }}
            </template>
            <template #cell-product_name="{ row }">
                <span class="font-semibold text-neutral-950">{{ row.product_name || '—' }}</span>
                <p v-if="row.brand" class="mt-0.5 text-xs text-neutral-500">{{ row.brand }}</p>
            </template>
            <template #cell-viscosity="{ value }">
                {{ value || '—' }}
            </template>
            <template #cell-quantity="{ row }">
                {{ formatOilQuantity(row.quantity, row.unit) }}
            </template>
            <template #cell-total_price="{ value }">
                {{ formatMoney(typeof value === 'number' ? value : null) }}
            </template>
            <template #actions="{ row }">
                <button type="button" class="inline-flex size-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40" :aria-label="`Modifier ${oilLabel(row)}`" @click="emit('edit', row)">
                    <i class="fa-solid fa-pen text-xs" aria-hidden="true" />
                </button>
                <button type="button" class="inline-flex size-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40 disabled:opacity-50" :aria-label="`Supprimer ${oilLabel(row)}`" :disabled="deletingId === row.id" @click="onDelete(row)">
                    <span v-if="deletingId === row.id" class="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
                    <i v-else class="fa-solid fa-trash text-xs" aria-hidden="true" />
                </button>
            </template>
        </UiTable>
    </div>
</template>
