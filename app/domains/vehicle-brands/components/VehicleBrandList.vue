<script setup lang="ts">
import { useVehicleBrandStore } from '../stores/vehicleBrandStore'
import type { VehicleBrand } from '../types'
import { VEHICLE_BRAND_ORDER_OPTIONS, vehicleBrandLogoUrl, type VehicleBrandOrderKey } from '../utils/options'

const emit = defineEmits<{
    edit: [vehicleBrand: VehicleBrand]
}>()

const columns = [
    { key: 'name', label: 'Marque' },
    { key: 'key', label: 'Clé' },
    { key: 'is_active', label: 'Active' },
    { key: 'updated_at', label: 'Mis à jour' },
]

const store = useVehicleBrandStore()
const alert = useAlert()
const toast = useToast()
const config = useRuntimeConfig()

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

onMounted(() => {
    void store.fetchPage()
})

function logoSrc(brand: VehicleBrand) {
    return vehicleBrandLogoUrl(brand, config.public.apiBaseUrl as string)
}

function onActiveFilterChange(event: Event) {
    void store.applyIsActive((event.target as HTMLSelectElement).value as '' | 'true' | 'false')
}

function onOrderChange(event: Event) {
    void store.applyOrder((event.target as HTMLSelectElement).value as VehicleBrandOrderKey)
}

async function onDelete(brand: VehicleBrand) {
    if (deletingId.value) return

    const result = await alert.confirm({
        title: 'Supprimer cette marque ?',
        text: `${brand.name} sera retirée de la liste.`,
        confirmText: 'Supprimer',
    })
    if (!result.isConfirmed) return

    deletingId.value = brand.id
    const deleted = await store.remove(brand.id)
    deletingId.value = null

    if (!deleted) {
        toast.error('Suppression impossible', store.mutationError ? extractErrorMessage(store.mutationError) : undefined)
        return
    }

    toast.success('Marque supprimée', `${brand.name} a été retirée.`)
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
            label="Marques"
            search-placeholder="Rechercher une marque"
            :empty-title="errorMessage ? 'Chargement impossible' : 'Aucune marque'"
            :empty-text="errorMessage
                ? 'La liste n’a pas pu être récupérée.'
                : 'Créez une marque pour commencer.'"
        >
            <template #toolbar-start>
                <label class="relative inline-flex h-10 items-center rounded-full bg-neutral-100 pl-4 pr-3 text-sm text-neutral-500">
                    <span class="mr-2">Statut</span>
                    <select
                        :value="store.isActive"
                        :disabled="store.loading"
                        class="appearance-none bg-transparent pr-5 font-semibold text-neutral-900 outline-none disabled:cursor-not-allowed"
                        aria-label="Filtrer par statut"
                        @change="onActiveFilterChange"
                    >
                        <option value="">Toutes</option>
                        <option value="true">Actives</option>
                        <option value="false">Inactives</option>
                    </select>
                    <i class="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[10px] text-neutral-400" aria-hidden="true" />
                </label>

                <label class="relative inline-flex h-10 items-center rounded-full bg-neutral-100 pl-4 pr-3 text-sm text-neutral-500">
                    <span class="mr-2">Tri</span>
                    <select
                        :value="store.orderKey"
                        :disabled="store.loading"
                        class="appearance-none bg-transparent pr-5 font-semibold text-neutral-900 outline-none disabled:cursor-not-allowed"
                        aria-label="Trier les marques"
                        @change="onOrderChange"
                    >
                        <option
                            v-for="option in VEHICLE_BRAND_ORDER_OPTIONS"
                            :key="option.value"
                            :value="option.value"
                        >
                            {{ option.label }}
                        </option>
                    </select>
                    <i class="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[10px] text-neutral-400" aria-hidden="true" />
                </label>
            </template>

            <template #cell-name="{ row }">
                <span class="inline-flex items-center gap-3">
                    <span class="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-100 text-neutral-400">
                        <img
                            v-if="logoSrc(row)"
                            :src="logoSrc(row)"
                            :alt="`${row.name} logo`"
                            class="size-full object-contain p-1"
                        >
                        <i v-else class="fa-solid fa-industry text-xs" aria-hidden="true" />
                    </span>
                    <span class="font-semibold text-neutral-950">{{ row.name }}</span>
                </span>
            </template>

            <template #cell-is_active="{ value }">
                <span
                    class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
                    :class="value ? 'bg-primary/10 text-primary' : 'bg-neutral-100 text-neutral-600'"
                >
                    {{ value ? 'Oui' : 'Non' }}
                </span>
            </template>

            <template #cell-updated_at="{ value }">
                {{ formatDate(typeof value === 'string' ? value : '') }}
            </template>

            <template #actions="{ row }">
                <button
                    type="button"
                    class="inline-flex size-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    :aria-label="`Modifier ${row.name}`"
                    @click="emit('edit', row)"
                >
                    <i class="fa-solid fa-pen text-xs" aria-hidden="true" />
                </button>
                <button
                    type="button"
                    class="inline-flex size-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40 disabled:opacity-50"
                    :aria-label="`Supprimer ${row.name}`"
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
