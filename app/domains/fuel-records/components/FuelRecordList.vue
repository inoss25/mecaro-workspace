<script setup lang="ts">
import { useFuelRecordStore } from '../stores/fuelRecordStore'
import type { FuelRecord, FuelType } from '../types'
import {
    formatMoney,
    formatQuantity,
    fuelRecordVehicleLabel,
    fuelTypeClass,
    fuelTypeLabel,
    FUEL_RECORD_ORDER_OPTIONS,
    FUEL_TYPE_OPTIONS,
    type FuelRecordOrderKey,
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
    edit: [fuelRecord: FuelRecord]
}>()

const columns = computed(() => {
    const base = [
        { key: 'fuel_date', label: 'Date' },
        ...(props.hideVehicleColumn ? [] : [{ key: 'vehicle', label: 'Véhicule' }]),
        { key: 'fuel_type', label: 'Carburant' },
        { key: 'mileage', label: 'Km' },
        { key: 'quantity', label: 'Quantité' },
        { key: 'total_price', label: 'Montant' },
        { key: 'full_tank', label: 'Plein' },
    ]
    return base
})

const store = useFuelRecordStore()
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
    if (!props.hideVehicleFilter) void store.fetchVehicles()
})

function onVehicleChange(event: Event) {
    void store.applyVehicle((event.target as HTMLSelectElement).value)
}

function onFuelChange(event: Event) {
    void store.applyFuelType((event.target as HTMLSelectElement).value as FuelType | '')
}

function onFullTankChange(event: Event) {
    void store.applyFullTank((event.target as HTMLSelectElement).value as '' | 'true' | 'false')
}

function onOrderChange(event: Event) {
    void store.applyOrder((event.target as HTMLSelectElement).value as FuelRecordOrderKey)
}

async function onDelete(record: FuelRecord) {
    if (deletingId.value) return

    const label = `${fuelRecordVehicleLabel(record.vehicle)} — ${formatMoney(record.total_price)}`
    const result = await alert.confirm({
        title: 'Supprimer ce plein ?',
        text: `${label} sera retiré.`,
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

    toast.success('Plein supprimé', 'L’entrée a été retirée.')
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
            label="Pleins de carburant"
            search-placeholder="Rechercher un plein"
            :empty-title="errorMessage ? 'Chargement impossible' : 'Aucun plein'"
            :empty-text="errorMessage
                ? 'La liste n’a pas pu être récupérée.'
                : 'Enregistrez un plein pour commencer.'"
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
                    <span class="mr-2">Carburant</span>
                    <select
                        :value="store.fuelType"
                        :disabled="store.loading"
                        class="appearance-none bg-transparent pr-5 font-semibold text-neutral-900 outline-none disabled:cursor-not-allowed"
                        aria-label="Filtrer par carburant"
                        @change="onFuelChange"
                    >
                        <option value="">Tous</option>
                        <option
                            v-for="option in FUEL_TYPE_OPTIONS"
                            :key="option.value"
                            :value="option.value"
                        >
                            {{ option.label }}
                        </option>
                    </select>
                    <i class="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[10px] text-neutral-400" aria-hidden="true" />
                </label>

                <label class="relative inline-flex h-10 items-center rounded-full bg-neutral-100 pl-4 pr-3 text-sm text-neutral-500">
                    <span class="mr-2">Plein</span>
                    <select
                        :value="store.fullTank"
                        :disabled="store.loading"
                        class="appearance-none bg-transparent pr-5 font-semibold text-neutral-900 outline-none disabled:cursor-not-allowed"
                        aria-label="Filtrer par type de plein"
                        @change="onFullTankChange"
                    >
                        <option value="">Tous</option>
                        <option value="true">Complet</option>
                        <option value="false">Partiel</option>
                    </select>
                    <i class="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[10px] text-neutral-400" aria-hidden="true" />
                </label>

                <label class="relative inline-flex h-10 items-center rounded-full bg-neutral-100 pl-4 pr-3 text-sm text-neutral-500">
                    <span class="mr-2">Tri</span>
                    <select
                        :value="store.orderKey"
                        :disabled="store.loading"
                        class="appearance-none bg-transparent pr-5 font-semibold text-neutral-900 outline-none disabled:cursor-not-allowed"
                        aria-label="Trier les pleins"
                        @change="onOrderChange"
                    >
                        <option
                            v-for="option in FUEL_RECORD_ORDER_OPTIONS"
                            :key="option.value"
                            :value="option.value"
                        >
                            {{ option.label }}
                        </option>
                    </select>
                    <i class="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[10px] text-neutral-400" aria-hidden="true" />
                </label>
            </template>

            <template #cell-fuel_date="{ value }">
                {{ formatDate(typeof value === 'string' ? value : '') }}
            </template>

            <template #cell-vehicle="{ row }">
                {{ fuelRecordVehicleLabel(row.vehicle) }}
            </template>

            <template #cell-fuel_type="{ row }">
                <span
                    class="inline-flex h-7 items-center rounded-full px-2.5 text-xs font-semibold"
                    :class="fuelTypeClass(row.fuel_type)"
                >
                    {{ fuelTypeLabel(row.fuel_type) }}
                </span>
            </template>

            <template #cell-mileage="{ value }">
                {{ typeof value === 'number' ? `${value.toLocaleString('fr-FR')} km` : '—' }}
            </template>

            <template #cell-quantity="{ value }">
                {{ formatQuantity(typeof value === 'number' ? value : null) }}
            </template>

            <template #cell-total_price="{ value }">
                {{ formatMoney(typeof value === 'number' ? value : null) }}
            </template>

            <template #cell-full_tank="{ value }">
                <span
                    class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
                    :class="value ? 'bg-primary/10 text-primary' : 'bg-neutral-100 text-neutral-600'"
                >
                    {{ value ? 'Complet' : 'Partiel' }}
                </span>
            </template>

            <template #actions="{ row }">
                <button
                    type="button"
                    class="inline-flex size-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    :aria-label="`Modifier le plein du ${formatDate(row.fuel_date)}`"
                    @click="emit('edit', row)"
                >
                    <i class="fa-solid fa-pen text-xs" aria-hidden="true" />
                </button>
                <button
                    type="button"
                    class="inline-flex size-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40 disabled:opacity-50"
                    :aria-label="`Supprimer le plein du ${formatDate(row.fuel_date)}`"
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
