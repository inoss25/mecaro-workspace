<script setup lang="ts">
import { useVehicleStore } from '../stores/vehicleStore'
import type { FuelType, Vehicle } from '../types'
import { fuelTypeClass, fuelTypeLabel, FUEL_TYPE_OPTIONS, isHexColor, vehicleIdentity, vehicleImageSrc, vehicleLabel, VEHICLE_ORDER_OPTIONS, type VehicleOrderKey } from '../utils/options'

const emit = defineEmits<{
    open: [vehicleId: string]
    edit: [vehicleId: string]
}>()

const columns = [
    { key: 'vehicle', label: 'Véhicule' },
    { key: 'registration_number', label: 'Immatriculation' },
    { key: 'vehicle_type', label: 'Type' },
    { key: 'fuel_type', label: 'Carburant' },
    { key: 'user', label: 'Propriétaire' },
    { key: 'color', label: 'Couleur' },
    { key: 'is_active', label: 'Actif' },
    { key: 'created_at', label: 'Créé le' },
]

const store = useVehicleStore()
const alert = useAlert()
const toast = useToast()
const config = useRuntimeConfig()

const searchInput = ref(store.search)
const deletingId = ref<string | null>(null)
const activeId = ref<string | null>(null)
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

onMounted(() => {
    void store.fetchPage()
    void store.fetchOptions()
})

function onFuelChange(event: Event) {
    void store.applyFuelType((event.target as HTMLSelectElement).value as FuelType | '')
}

function onTypeChange(event: Event) {
    void store.applyVehicleType((event.target as HTMLSelectElement).value)
}

function onBrandChange(event: Event) {
    void store.applyVehicleBrand((event.target as HTMLSelectElement).value)
}

function imageSrc(path: string | null | undefined) {
    return vehicleImageSrc(path, config.public.apiBaseUrl as string)
}

function onActiveFilterChange(event: Event) {
    void store.applyIsActive((event.target as HTMLSelectElement).value as '' | 'true' | 'false')
}

function onOrderChange(event: Event) {
    void store.applyOrder((event.target as HTMLSelectElement).value as VehicleOrderKey)
}

async function onActiveChange(vehicle: Vehicle, next: boolean) {
    if (next === vehicle.is_active || activeId.value || store.saving) return

    activeId.value = vehicle.id
    const updated = await store.update(vehicle.id, { is_active: next })
    activeId.value = null

    if (!updated) {
        toast.error('Statut non modifié', store.mutationError ? extractErrorMessage(store.mutationError) : undefined)
        return
    }

    toast.success('Statut mis à jour', `${vehicleLabel(updated)} est ${updated.is_active ? 'actif' : 'inactif'}.`)
}

async function onDelete(vehicle: Vehicle) {
    if (deletingId.value) return

    const label = vehicleLabel(vehicle)
    const result = await alert.confirm({
        title: 'Supprimer ce véhicule ?',
        text: `${label} sera retiré de la liste.`,
        confirmText: 'Supprimer',
    })
    if (!result.isConfirmed) return

    deletingId.value = vehicle.id
    const deleted = await store.remove(vehicle.id)
    deletingId.value = null

    if (!deleted) {
        toast.error('Suppression impossible', store.mutationError ? extractErrorMessage(store.mutationError) : undefined)
        return
    }

    toast.success('Véhicule supprimé', `${label} a été retiré.`)
}

function subtitle(vehicle: Vehicle) {
    const identity = vehicleIdentity(vehicle)
    if (vehicle.name?.trim() && identity) return identity
    return vehicle.registration_number?.trim() || ''
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <p v-if="errorMessage"
            class="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert">
            <span>{{ errorMessage }}</span>
            <button type="button" class="font-semibold text-red-800 underline-offset-2 hover:underline"
                @click="store.fetchPage()">
                Réessayer
            </button>
        </p>

        <UiTable v-model:page="pageModel" v-model:page-size="pageSizeModel" v-model:search="searchInput"
            :columns="columns" :rows="rows" :loading="store.loading" :total="store.total" label="Véhicules"
            search-placeholder="Rechercher un véhicule"
            :empty-title="errorMessage ? 'Chargement impossible' : 'Aucun véhicule'" :empty-text="errorMessage
                ? 'La liste n’a pas pu être récupérée.'
                : 'Créez un véhicule pour commencer.'">
            <template #toolbar-start>
                <label
                    class="relative inline-flex h-10 items-center rounded-full bg-neutral-100 pl-4 pr-3 text-sm text-neutral-500">
                    <span class="mr-2">Type</span>
                    <select :value="store.vehicleTypeId" :disabled="store.loading"
                        class="max-w-36 appearance-none truncate bg-transparent pr-5 font-semibold text-neutral-900 outline-none disabled:cursor-not-allowed"
                        aria-label="Filtrer par type" @change="onTypeChange">
                        <option value="">Tous</option>
                        <option v-for="type in store.vehicleTypes" :key="type.id" :value="type.id">
                            {{ type.name }}
                        </option>
                    </select>
                    <i class="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[10px] text-neutral-400"
                        aria-hidden="true" />
                </label>

                <label
                    class="relative inline-flex h-10 items-center rounded-full bg-neutral-100 pl-4 pr-3 text-sm text-neutral-500">
                    <span class="mr-2">Marque</span>
                    <select :value="store.vehicleBrandId" :disabled="store.loading"
                        class="max-w-36 appearance-none truncate bg-transparent pr-5 font-semibold text-neutral-900 outline-none disabled:cursor-not-allowed"
                        aria-label="Filtrer par marque" @change="onBrandChange">
                        <option value="">Toutes</option>
                        <option v-for="brand in store.vehicleBrands" :key="brand.id" :value="brand.id">
                            {{ brand.name }}
                        </option>
                    </select>
                    <i class="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[10px] text-neutral-400"
                        aria-hidden="true" />
                </label>

                <label
                    class="relative inline-flex h-10 items-center rounded-full bg-neutral-100 pl-4 pr-3 text-sm text-neutral-500">
                    <span class="mr-2">Carburant</span>
                    <select :value="store.fuelType" :disabled="store.loading"
                        class="appearance-none bg-transparent pr-5 font-semibold text-neutral-900 outline-none disabled:cursor-not-allowed"
                        aria-label="Filtrer par carburant" @change="onFuelChange">
                        <option value="">Tous</option>
                        <option v-for="option in FUEL_TYPE_OPTIONS" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                    <i class="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[10px] text-neutral-400"
                        aria-hidden="true" />
                </label>

                <label
                    class="relative inline-flex h-10 items-center rounded-full bg-neutral-100 pl-4 pr-3 text-sm text-neutral-500">
                    <span class="mr-2">État</span>
                    <select :value="store.isActive" :disabled="store.loading"
                        class="appearance-none bg-transparent pr-5 font-semibold text-neutral-900 outline-none disabled:cursor-not-allowed"
                        aria-label="Filtrer par état" @change="onActiveFilterChange">
                        <option value="">Tous</option>
                        <option value="true">Actifs</option>
                        <option value="false">Inactifs</option>
                    </select>
                    <i class="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[10px] text-neutral-400"
                        aria-hidden="true" />
                </label>

                <label
                    class="relative inline-flex h-10 items-center rounded-full bg-neutral-100 pl-4 pr-3 text-sm text-neutral-500">
                    <span class="mr-2">Tri</span>
                    <select :value="store.orderKey" :disabled="store.loading"
                        class="appearance-none bg-transparent pr-5 font-semibold text-neutral-900 outline-none disabled:cursor-not-allowed"
                        aria-label="Trier les véhicules" @change="onOrderChange">
                        <option v-for="option in VEHICLE_ORDER_OPTIONS" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                    <i class="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[10px] text-neutral-400"
                        aria-hidden="true" />
                </label>
            </template>

            <template #cell-vehicle="{ row }">
                <span class="inline-flex items-center gap-3">
                    <span
                        class="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-100 text-neutral-400">
                        <img v-if="imageSrc(row.image_path)" :src="imageSrc(row.image_path)" alt=""
                            class="size-full object-cover">
                        <i v-else class="fa-solid fa-car text-xs" aria-hidden="true" />
                    </span>
                    <span class="min-w-0 text-left">
                        <button
                            type="button"
                            class="block max-w-full truncate font-semibold text-neutral-950 transition-colors hover:text-primary"
                            @click="emit('open', row.id)"
                        >
                            {{ vehicleLabel(row) }}
                        </button>
                        <span v-if="subtitle(row)" class="block truncate text-xs text-neutral-500">{{ subtitle(row) }}</span>
                    </span>
                </span>
            </template>

            <template #cell-registration_number="{ value }">
                <span v-if="value">{{ value }}</span>
                <span v-else class="text-neutral-300">—</span>
            </template>

            <template #cell-vehicle_type="{ row }">
                <span class="inline-flex items-center gap-2">
                    <i v-if="row.vehicleType.icon" :class="row.vehicleType.icon"
                        class="w-4 text-center text-neutral-500" aria-hidden="true" />
                    {{ row.vehicleType.name }}
                </span>
            </template>

            <template #cell-fuel_type="{ row }">
                <span class="inline-flex h-7 items-center rounded-full px-2.5 text-xs font-semibold"
                    :class="fuelTypeClass(row.fuel_type)">
                    {{ fuelTypeLabel(row.fuel_type) }}
                </span>
            </template>

            <template #cell-user="{ row }">
                {{ row.user.name }}
            </template>

            <template #cell-color="{ value }">
                <span v-if="typeof value === 'string' && value.trim()" class="inline-flex items-center gap-2">
                    <span v-if="isHexColor(value)" class="size-3 rounded-full ring-1 ring-black/10"
                        :style="{ backgroundColor: value }" aria-hidden="true" />
                    {{ value }}
                </span>
                <span v-else class="text-neutral-300">—</span>
            </template>

            <template #cell-is_active="{ row }">
                <UiSwitch :model-value="row.is_active" size="sm" :disabled="store.saving || deletingId === row.id"
                    :aria-label="`${vehicleLabel(row)} ${row.is_active ? 'actif' : 'inactif'}`"
                    @update:model-value="onActiveChange(row, $event)" />
            </template>

            <template #cell-created_at="{ value }">
                {{ formatDate(typeof value === 'string' ? value : '') }}
            </template>

            <template #actions="{ row }">
                <button
                    type="button"
                    class="inline-flex size-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    :aria-label="`Voir ${vehicleLabel(row)}`"
                    @click="emit('open', row.id)"
                >
                    <i class="fa-solid fa-eye text-xs" aria-hidden="true" />
                </button>
                <button type="button"
                    class="inline-flex size-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    :aria-label="`Modifier ${vehicleLabel(row)}`" @click="emit('edit', row.id)">
                    <i class="fa-solid fa-pen text-xs" aria-hidden="true" />
                </button>
                <button type="button"
                    class="inline-flex size-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40 disabled:opacity-50"
                    :aria-label="`Supprimer ${vehicleLabel(row)}`" :disabled="deletingId === row.id"
                    @click="onDelete(row)">
                    <span v-if="deletingId === row.id"
                        class="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
                        aria-hidden="true" />
                    <i v-else class="fa-solid fa-trash text-xs" aria-hidden="true" />
                </button>
            </template>
        </UiTable>
    </div>
</template>
