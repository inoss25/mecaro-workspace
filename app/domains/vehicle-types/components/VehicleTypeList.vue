<script setup lang="ts">
import { useVehicleTypeStore } from '../stores/vehicleTypeStore'
import type { VehicleType } from '../types'

const emit = defineEmits<{
    edit: [vehicleType: VehicleType]
}>()

const columns = [
    { key: 'name', label: 'Nom' },
    { key: 'key', label: 'Clé' },
    { key: 'icon', label: 'Icône' },
    { key: 'is_active', label: 'Actif' },
    { key: 'updated_at', label: 'Mis à jour' },
]

const store = useVehicleTypeStore()
const alert = useAlert()
const toast = useToast()

const rows = computed(() => store.items)
const errorMessage = computed(() => store.error ? extractErrorMessage(store.error) : '')
const deletingId = ref<string | null>(null)

onMounted(() => {
    void store.fetchAll()
})

async function onDelete(vehicleType: VehicleType) {
    if (deletingId.value) return

    const result = await alert.confirm({
        title: 'Supprimer ce type ?',
        text: `${vehicleType.name} sera retiré de la liste.`,
        confirmText: 'Supprimer',
    })
    if (!result.isConfirmed) return

    deletingId.value = vehicleType.id

    const deleted = await store.remove(vehicleType.id)
    deletingId.value = null

    if (!deleted) {
        toast.error('Suppression impossible', store.mutationError ? extractErrorMessage(store.mutationError) : undefined)
        return
    }

    toast.success('Type supprimé', `${deleted.name} a été retiré.`)
}

function isIconClass(value: unknown): value is string {
    return typeof value === 'string' && value.includes('fa-')
}

</script>

<template>
    <div class="flex flex-col gap-4">
        <p v-if="errorMessage"
            class="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert">
            <span>{{ errorMessage }}</span>
            <button type="button" class="font-semibold text-red-800 underline-offset-2 hover:underline"
                @click="store.fetchAll()">
                Réessayer
            </button>
        </p>

        <UiTable :columns="columns" :rows="rows" :loading="store.loading" label="Types de véhicules"
            search-placeholder="Rechercher un type"             :empty-title="errorMessage ? 'Chargement impossible' : 'Aucun type'"
            :empty-text="errorMessage
                ? 'La liste n’a pas pu être récupérée.'
                : 'Créez un type de véhicule pour classer les engins.'">
            <template #cell-icon="{ value }">
                <span v-if="isIconClass(value)" class="inline-flex items-center gap-2">
                    <i :class="value" class="w-4 text-center text-neutral-500" aria-hidden="true" />
                    <span>{{ value }}</span>
                </span>
                <span v-else-if="value">{{ value }}</span>
                <span v-else class="text-neutral-300">—</span>
            </template>

            <template #cell-updated_at="{ value }">
                {{ formatDate(typeof value === 'string' ? value : '') }}
            </template>

            <template #actions="{ row }">
                <button type="button"
                    class="inline-flex size-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    :aria-label="`Modifier ${row.name}`" @click="emit('edit', row)">
                    <i class="fa-solid fa-pen text-xs" aria-hidden="true" />
                </button>
                <button type="button"
                    class="inline-flex size-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40 disabled:opacity-50"
                    :aria-label="`Supprimer ${row.name}`"
                    :disabled="deletingId === row.id"
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
