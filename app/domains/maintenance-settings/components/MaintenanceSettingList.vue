<script setup lang="ts">
import { maintenanceVehicleLabel } from '../../maintenance-records/utils/options'
import { useMaintenanceSettingStore } from '../stores/maintenanceSettingStore'
import type { MaintenanceSetting } from '../types'
import { formatInterval, MAINTENANCE_SETTING_ORDER_OPTIONS, type MaintenanceSettingOrderKey } from '../utils/options'

const props = withDefaults(defineProps<{
    vehicleId?: string
    hideVehicleFilter?: boolean
    hideVehicleColumn?: boolean
}>(), {
    vehicleId: '',
    hideVehicleFilter: false,
    hideVehicleColumn: false,
})

const emit = defineEmits<{ edit: [setting: MaintenanceSetting] }>()

const columns = computed(() => [
    ...(props.hideVehicleColumn ? [] : [{ key: 'vehicle', label: 'Véhicule' }]),
    { key: 'maintenance_type', label: 'Type' },
    { key: 'interval_km', label: 'Intervalle' },
    { key: 'is_active', label: 'Actif' },
])

const store = useMaintenanceSettingStore()
const alert = useAlert()
const toast = useToast()
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

function onActiveChange(event: Event) {
    void store.applyIsActive((event.target as HTMLSelectElement).value as '' | 'true' | 'false')
}

function onOrderChange(event: Event) {
    void store.applyOrder((event.target as HTMLSelectElement).value as MaintenanceSettingOrderKey)
}

async function onDelete(setting: MaintenanceSetting) {
    if (deletingId.value) return
    const label = `${maintenanceVehicleLabel(setting.vehicle)} — ${setting.maintenance_type.name}`
    const result = await alert.confirm({
        title: 'Supprimer cet intervalle ?',
        text: `${label} sera retiré.`,
        confirmText: 'Supprimer',
    })
    if (!result.isConfirmed) return
    deletingId.value = setting.id
    const deleted = await store.remove(setting.id)
    deletingId.value = null
    if (!deleted) {
        toast.error('Suppression impossible', store.mutationError ? extractErrorMessage(store.mutationError) : undefined)
        return
    }
    toast.success('Intervalle supprimé', 'Le réglage a été retiré.')
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
            :columns="columns"
            :rows="rows"
            :loading="store.loading"
            :total="store.total"
            :searchable="false"
            label="Intervalles"
            :empty-title="errorMessage ? 'Chargement impossible' : 'Aucun intervalle'"
            :empty-text="errorMessage ? 'La liste n’a pas pu être récupérée.' : 'Définissez la périodicité d’un entretien pour un véhicule.'"
        >
            <template #toolbar-start>
                <label v-if="!hideVehicleFilter" class="relative inline-flex h-10 items-center rounded-full bg-neutral-100 pl-4 pr-3 text-sm text-neutral-500">
                    <span class="mr-2">Véhicule</span>
                    <select :value="store.vehicleId" :disabled="store.loading || !!store.fixedVehicleId" class="max-w-36 appearance-none truncate bg-transparent pr-5 font-semibold text-neutral-900 outline-none disabled:cursor-not-allowed" aria-label="Filtrer par véhicule" @change="onVehicleChange">
                        <option value="">Tous</option>
                        <option v-for="vehicle in store.vehicles" :key="vehicle.id" :value="vehicle.id">{{ store.vehicleOptionLabel(vehicle) }}</option>
                    </select>
                    <i class="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[10px] text-neutral-400" aria-hidden="true" />
                </label>
                <label class="relative inline-flex h-10 items-center rounded-full bg-neutral-100 pl-4 pr-3 text-sm text-neutral-500">
                    <span class="mr-2">Type</span>
                    <select :value="store.typeId" :disabled="store.loading || store.optionsLoading" class="max-w-40 appearance-none truncate bg-transparent pr-5 font-semibold text-neutral-900 outline-none disabled:cursor-not-allowed" aria-label="Filtrer par type" @change="onTypeChange">
                        <option value="">Tous</option>
                        <option v-for="type in store.types" :key="type.id" :value="type.id">{{ store.typeOptionLabel(type) }}</option>
                    </select>
                    <i class="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[10px] text-neutral-400" aria-hidden="true" />
                </label>
                <label class="relative inline-flex h-10 items-center rounded-full bg-neutral-100 pl-4 pr-3 text-sm text-neutral-500">
                    <span class="mr-2">Statut</span>
                    <select :value="store.isActive" :disabled="store.loading" class="appearance-none bg-transparent pr-5 font-semibold text-neutral-900 outline-none" aria-label="Filtrer par statut" @change="onActiveChange">
                        <option value="">Tous</option>
                        <option value="true">Actifs</option>
                        <option value="false">Inactifs</option>
                    </select>
                    <i class="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[10px] text-neutral-400" aria-hidden="true" />
                </label>
                <label class="relative inline-flex h-10 items-center rounded-full bg-neutral-100 pl-4 pr-3 text-sm text-neutral-500">
                    <span class="mr-2">Tri</span>
                    <select :value="store.orderKey" :disabled="store.loading" class="appearance-none bg-transparent pr-5 font-semibold text-neutral-900 outline-none" aria-label="Trier les intervalles" @change="onOrderChange">
                        <option v-for="option in MAINTENANCE_SETTING_ORDER_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</option>
                    </select>
                    <i class="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[10px] text-neutral-400" aria-hidden="true" />
                </label>
            </template>
            <template #cell-vehicle="{ row }">{{ maintenanceVehicleLabel(row.vehicle) }}</template>
            <template #cell-maintenance_type="{ row }">{{ row.maintenance_type?.name ?? '—' }}</template>
            <template #cell-interval_km="{ value }">{{ formatInterval(typeof value === 'number' ? value : null) }}</template>
            <template #cell-is_active="{ value }">
                <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold" :class="value ? 'bg-primary/10 text-primary' : 'bg-neutral-100 text-neutral-600'">{{ value ? 'Oui' : 'Non' }}</span>
            </template>
            <template #actions="{ row }">
                <button type="button" class="inline-flex size-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900" :aria-label="`Modifier l’intervalle ${row.maintenance_type.name}`" @click="emit('edit', row)"><i class="fa-solid fa-pen text-xs" /></button>
                <button type="button" class="inline-flex size-9 items-center justify-center rounded-full text-neutral-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50" :aria-label="`Supprimer l’intervalle ${row.maintenance_type.name}`" :disabled="deletingId === row.id" @click="onDelete(row)">
                    <span v-if="deletingId === row.id" class="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <i v-else class="fa-solid fa-trash text-xs" />
                </button>
            </template>
        </UiTable>
    </div>
</template>
