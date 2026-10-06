<script setup lang="ts">
import { useMaintenanceRecordStore } from '../stores/maintenanceRecordStore'
import type { MaintenanceRecord } from '../types'
import {
    formatMoney,
    MAINTENANCE_RECORD_ORDER_OPTIONS,
    maintenanceVehicleLabel,
    type MaintenanceRecordOrderKey,
} from '../utils/options'

const props = withDefaults(defineProps<{
    vehicleId?: string
    hideVehicleFilter?: boolean
    hideVehicleColumn?: boolean
}>(), {
    vehicleId: '',
    hideVehicleFilter: false,
    hideVehicleColumn: false,
})

const emit = defineEmits<{
    edit: [record: MaintenanceRecord]
}>()

const columns = computed(() => [
    { key: 'maintenance_date', label: 'Date' },
    ...(props.hideVehicleColumn ? [] : [{ key: 'vehicle', label: 'Véhicule' }]),
    { key: 'maintenance_type', label: 'Type' },
    { key: 'mileage', label: 'Km' },
    { key: 'cost', label: 'Coût' },
    { key: 'oils', label: 'Huiles' },
    { key: 'parts', label: 'Pièces' },
])

const store = useMaintenanceRecordStore()
const alert = useAlert()
const toast = useToast()

const searchInput = ref(store.search)
const deletingId = ref<string | null>(null)
const rows = computed(() => store.items)
const errorMessage = computed(() => store.error ? extractErrorMessage(store.error) : '')

const pageModel = computed({
    get: () => store.page,
    set: (value: number) => {
        void store.setPage(value)
    },
})

const pageSizeModel = computed({
    get: () => store.perPage,
    set: (value: number) => {
        void store.setPerPage(value)
    },
})

watchDebounced(searchInput, (value) => {
    void store.applySearch(value)
}, { debounce: 300 })

watch(() => props.vehicleId, (value) => {
    void store.setFixedVehicleId(value || null)
}, { immediate: true })

onMounted(() => {
    void store.fetchOptions()
})

function onVehicleChange(event: Event) {
    void store.applyVehicle((event.target as HTMLSelectElement).value)
}

function onTypeChange(event: Event) {
    void store.applyType((event.target as HTMLSelectElement).value)
}

function onOrderChange(event: Event) {
    void store.applyOrder((event.target as HTMLSelectElement).value as MaintenanceRecordOrderKey)
}

async function onDelete(record: MaintenanceRecord) {
    if (deletingId.value) return

    const label = `${maintenanceVehicleLabel(record.vehicle)} — ${record.maintenance_type.name}`
    const result = await alert.confirm({
        title: 'Supprimer cette intervention ?',
        text: `${label} sera retirée.`,
        confirmText: 'Supprimer',
    })
    if (!result.isConfirmed) return

    deletingId.value = record.id
    const deleted = await store.remove(record.id)
    deletingId.value = null

    if (!deleted) {
        toast.error('Suppression impossible', store.mutationError ? extractErrorMessage(store.mutationError) : undefined)
        return
    }

    toast.success('Intervention supprimée', 'L’entrée a été retirée.')
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <p
            v-if="errorMessage"
            class="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
        >
            <span>{{ errorMessage }}</span>
            <button
                type="button"
                class="font-semibold text-red-800 underline-offset-2 hover:underline"
                @click="store.fetchPage()"
            >
                Réessayer
            </button>
        </p>

        <UiTable
            v-model:page="pageModel"
            v-model:page-size="pageSizeModel"
            v-model:search="searchInput"
            :columns="columns"
            :rows="rows"
            :loading="store.loading"
            :total="store.total"
            label="Interventions"
            search-placeholder="Rechercher une intervention"
            :empty-title="errorMessage ? 'Chargement impossible' : 'Aucune intervention'"
            :empty-text="errorMessage
                ? 'La liste n’a pas pu être récupérée.'
                : 'Enregistrez un entretien pour commencer.'"
        >
            <template #toolbar-start>
                <label
                    v-if="!hideVehicleFilter"
                    class="relative inline-flex h-10 items-center rounded-full bg-neutral-100 pl-4 pr-3 text-sm text-neutral-500"
                >
                    <span class="mr-2">Véhicule</span>
                    <select
                        :value="store.vehicleId"
                        :disabled="store.loading || !!store.fixedVehicleId"
                        class="max-w-36 appearance-none truncate bg-transparent pr-5 font-semibold text-neutral-900 outline-none disabled:cursor-not-allowed"
                        aria-label="Filtrer par véhicule"
                        @change="onVehicleChange"
                    >
                        <option value="">Tous</option>
                        <option
                            v-for="vehicle in store.vehicles"
                            :key="vehicle.id"
                            :value="vehicle.id"
                        >
                            {{ store.vehicleOptionLabel(vehicle) }}
                        </option>
                    </select>
                    <i class="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[10px] text-neutral-400" aria-hidden="true" />
                </label>

                <label class="relative inline-flex h-10 items-center rounded-full bg-neutral-100 pl-4 pr-3 text-sm text-neutral-500">
                    <span class="mr-2">Type</span>
                    <select
                        :value="store.typeId"
                        :disabled="store.loading || store.optionsLoading"
                        class="max-w-40 appearance-none truncate bg-transparent pr-5 font-semibold text-neutral-900 outline-none disabled:cursor-not-allowed"
                        aria-label="Filtrer par type"
                        @change="onTypeChange"
                    >
                        <option value="">Tous</option>
                        <option
                            v-for="type in store.types"
                            :key="type.id"
                            :value="type.id"
                        >
                            {{ store.typeOptionLabel(type) }}
                        </option>
                    </select>
                    <i class="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[10px] text-neutral-400" aria-hidden="true" />
                </label>

                <label class="relative inline-flex h-10 items-center rounded-full bg-neutral-100 pl-4 pr-3 text-sm text-neutral-500">
                    <span class="mr-2">Tri</span>
                    <select
                        :value="store.orderKey"
                        :disabled="store.loading"
                        class="appearance-none bg-transparent pr-5 font-semibold text-neutral-900 outline-none disabled:cursor-not-allowed"
                        aria-label="Trier les interventions"
                        @change="onOrderChange"
                    >
                        <option
                            v-for="option in MAINTENANCE_RECORD_ORDER_OPTIONS"
                            :key="option.value"
                            :value="option.value"
                        >
                            {{ option.label }}
                        </option>
                    </select>
                    <i class="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[10px] text-neutral-400" aria-hidden="true" />
                </label>
            </template>

            <template #cell-maintenance_date="{ value }">
                {{ formatDate(typeof value === 'string' ? value : '') }}
            </template>

            <template #cell-vehicle="{ row }">
                {{ maintenanceVehicleLabel(row.vehicle) }}
            </template>

            <template #cell-maintenance_type="{ row }">
                {{ row.maintenance_type?.name ?? '—' }}
            </template>

            <template #cell-mileage="{ value }">
                {{ typeof value === 'number' ? `${value.toLocaleString('fr-FR')} km` : '—' }}
            </template>

            <template #cell-cost="{ value }">
                {{ formatMoney(typeof value === 'number' ? value : null) }}
            </template>

            <template #cell-oils="{ row }">
                {{ row.oils?.length ?? 0 }}
            </template>

            <template #cell-parts="{ row }">
                {{ row.parts?.length ?? 0 }}
            </template>

            <template #actions="{ row }">
                <button
                    type="button"
                    class="inline-flex size-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    :aria-label="`Modifier l’intervention du ${formatDate(row.maintenance_date)}`"
                    @click="emit('edit', row)"
                >
                    <i class="fa-solid fa-pen text-xs" aria-hidden="true" />
                </button>
                <button
                    type="button"
                    class="inline-flex size-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40 disabled:opacity-50"
                    :aria-label="`Supprimer l’intervention du ${formatDate(row.maintenance_date)}`"
                    :disabled="deletingId === row.id"
                    @click="onDelete(row)"
                >
                    <span
                        v-if="deletingId === row.id"
                        class="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
                        aria-hidden="true"
                    />
                    <i v-else class="fa-solid fa-trash text-xs" aria-hidden="true" />
                </button>
            </template>
        </UiTable>
    </div>
</template>
