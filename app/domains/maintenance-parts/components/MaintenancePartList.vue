<script setup lang="ts">
import { formatMoney, maintenanceRecordLabel } from '../../maintenance-records/utils/options'
import { useMaintenancePartStore } from '../stores/maintenancePartStore'
import type { MaintenancePart } from '../types'
import { MAINTENANCE_PART_ORDER_OPTIONS, type MaintenancePartOrderKey } from '../utils/options'

const emit = defineEmits<{ edit: [part: MaintenancePart] }>()

const columns = [
    { key: 'name', label: 'Pièce' },
    { key: 'record', label: 'Intervention' },
    { key: 'quantity', label: 'Qté' },
    { key: 'total_price', label: 'Montant' },
]

const store = useMaintenancePartStore()
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

watchDebounced(searchInput, value => void store.applySearch(value), { debounce: 300 })
onMounted(() => {
    void store.fetchPage()
    void store.fetchRecords()
})

function onRecordChange(event: Event) {
    void store.applyRecord((event.target as HTMLSelectElement).value)
}

function onOrderChange(event: Event) {
    void store.applyOrder((event.target as HTMLSelectElement).value as MaintenancePartOrderKey)
}

async function onDelete(part: MaintenancePart) {
    if (deletingId.value) return
    const result = await alert.confirm({
        title: 'Supprimer cette pièce ?',
        text: `${part.name} sera retirée.`,
        confirmText: 'Supprimer',
    })
    if (!result.isConfirmed) return
    deletingId.value = part.id
    const deleted = await store.remove(part.id)
    deletingId.value = null
    if (!deleted) {
        toast.error('Suppression impossible', store.mutationError ? extractErrorMessage(store.mutationError) : undefined)
        return
    }
    toast.success('Pièce supprimée', `${part.name} a été retirée.`)
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
            label="Pièces"
            search-placeholder="Rechercher une pièce"
            :empty-title="errorMessage ? 'Chargement impossible' : 'Aucune pièce'"
            :empty-text="errorMessage ? 'La liste n’a pas pu être récupérée.' : 'Ajoutez une pièce à une intervention.'"
        >
            <template #toolbar-start>
                <label class="relative inline-flex h-10 items-center rounded-full bg-neutral-100 pl-4 pr-3 text-sm text-neutral-500">
                    <span class="mr-2">Intervention</span>
                    <select :value="store.recordId" :disabled="store.loading || store.optionsLoading" class="max-w-44 appearance-none truncate bg-transparent pr-5 font-semibold text-neutral-900 outline-none disabled:cursor-not-allowed" aria-label="Filtrer par intervention" @change="onRecordChange">
                        <option value="">Toutes</option>
                        <option v-for="record in store.records" :key="record.id" :value="record.id">{{ maintenanceRecordLabel(record) }}</option>
                    </select>
                    <i class="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[10px] text-neutral-400" aria-hidden="true" />
                </label>
                <label class="relative inline-flex h-10 items-center rounded-full bg-neutral-100 pl-4 pr-3 text-sm text-neutral-500">
                    <span class="mr-2">Tri</span>
                    <select :value="store.orderKey" :disabled="store.loading" class="appearance-none bg-transparent pr-5 font-semibold text-neutral-900 outline-none" aria-label="Trier les pièces" @change="onOrderChange">
                        <option v-for="option in MAINTENANCE_PART_ORDER_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</option>
                    </select>
                    <i class="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[10px] text-neutral-400" aria-hidden="true" />
                </label>
            </template>
            <template #cell-name="{ row }">
                <span class="font-semibold text-neutral-950">{{ row.name }}</span>
                <p v-if="row.reference || row.brand" class="mt-0.5 text-xs text-neutral-500">{{ [row.brand, row.reference].filter(Boolean).join(' · ') }}</p>
            </template>
            <template #cell-record="{ row }">{{ maintenanceRecordLabel(row.maintenanceRecord) }}</template>
            <template #cell-total_price="{ value }">{{ formatMoney(typeof value === 'number' ? value : null) }}</template>
            <template #actions="{ row }">
                <button type="button" class="inline-flex size-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900" :aria-label="`Modifier ${row.name}`" @click="emit('edit', row)"><i class="fa-solid fa-pen text-xs" /></button>
                <button type="button" class="inline-flex size-9 items-center justify-center rounded-full text-neutral-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50" :aria-label="`Supprimer ${row.name}`" :disabled="deletingId === row.id" @click="onDelete(row)">
                    <span v-if="deletingId === row.id" class="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <i v-else class="fa-solid fa-trash text-xs" />
                </button>
            </template>
        </UiTable>
    </div>
</template>
