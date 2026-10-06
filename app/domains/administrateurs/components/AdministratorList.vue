<script setup lang="ts">
import { useAdministratorStore } from '../stores/administratorStore'
import type { Administrator, AdministratorStatus } from '../types'
import { ADMINISTRATOR_ORDER_OPTIONS, genderLabel, GENDER_OPTIONS, statusClass, statusLabel, STATUS_OPTIONS, type AdministratorOrderKey } from '../utils/options'

const emit = defineEmits<{
    edit: [administrator: Administrator]
    password: [administrator: Administrator]
}>()

const columns = [
    { key: 'name', label: 'Administrateur' },
    { key: 'email', label: 'E-mail' },
    { key: 'gender', label: 'Genre' },
    { key: 'status', label: 'Statut' },
    { key: 'created_at', label: 'Créé le' },
]

const store = useAdministratorStore()
const alert = useAlert()
const toast = useToast()

const searchInput = ref(store.search)
const deletingId = ref<string | null>(null)
const statusId = ref<string | null>(null)
const pendingStatus = ref<Partial<Record<string, AdministratorStatus>>>({})
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

function onGenderChange(event: Event) {
    void store.applyGender((event.target as HTMLSelectElement).value as typeof store.gender)
}

function onStatusFilterChange(event: Event) {
    void store.applyStatus((event.target as HTMLSelectElement).value as typeof store.status)
}

function onOrderChange(event: Event) {
    void store.applyOrder((event.target as HTMLSelectElement).value as AdministratorOrderKey)
}

async function onStatusChange(administrator: Administrator, event: Event) {
    const select = event.target as HTMLSelectElement
    const nextStatus = select.value as AdministratorStatus
    if (!nextStatus || nextStatus === administrator.status || statusId.value) {
        select.value = administrator.status
        return
    }

    pendingStatus.value = { ...pendingStatus.value, [administrator.id]: nextStatus }
    statusId.value = administrator.id
    const updated = await store.toggleStatus(administrator.id, nextStatus)
    const rest = { ...pendingStatus.value }
    delete rest[administrator.id]
    pendingStatus.value = rest
    statusId.value = null

    if (!updated) {
        select.value = administrator.status
        toast.error('Statut non modifié', store.mutationError ? extractErrorMessage(store.mutationError) : undefined)
        return
    }

    toast.success('Statut mis à jour', `${updated.name} : ${statusLabel(updated.status)}.`)
}

async function onDelete(administrator: Administrator) {
    if (deletingId.value) return

    const result = await alert.confirm({
        title: 'Supprimer cet administrateur ?',
        text: `${administrator.name} sera retiré de la liste.`,
        confirmText: 'Supprimer',
    })
    if (!result.isConfirmed) return

    deletingId.value = administrator.id
    const deleted = await store.remove(administrator.id)
    deletingId.value = null

    if (!deleted) {
        toast.error('Suppression impossible', store.mutationError ? extractErrorMessage(store.mutationError) : undefined)
        return
    }

    toast.success('Administrateur supprimé', `${deleted.name} a été retiré.`)
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
            label="Administrateurs"
            search-placeholder="Rechercher un administrateur"
            :empty-title="errorMessage ? 'Chargement impossible' : 'Aucun administrateur'"
            :empty-text="errorMessage
                ? 'La liste n’a pas pu être récupérée.'
                : 'Créez un administrateur pour commencer.'"
        >
            <template #toolbar-start>
                <label class="relative inline-flex h-10 items-center rounded-full bg-neutral-100 pl-4 pr-3 text-sm text-neutral-500">
                    <span class="mr-2">Genre</span>
                    <select
                        :value="store.gender"
                        :disabled="store.loading"
                        class="appearance-none bg-transparent pr-5 font-semibold text-neutral-900 outline-none disabled:cursor-not-allowed"
                        aria-label="Filtrer par genre"
                        @change="onGenderChange"
                    >
                        <option value="">Tous</option>
                        <option
                            v-for="option in GENDER_OPTIONS"
                            :key="option.value"
                            :value="option.value"
                        >
                            {{ option.label }}
                        </option>
                    </select>
                    <i class="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[10px] text-neutral-400" aria-hidden="true" />
                </label>

                <label class="relative inline-flex h-10 items-center rounded-full bg-neutral-100 pl-4 pr-3 text-sm text-neutral-500">
                    <span class="mr-2">Statut</span>
                    <select
                        :value="store.status"
                        :disabled="store.loading"
                        class="appearance-none bg-transparent pr-5 font-semibold text-neutral-900 outline-none disabled:cursor-not-allowed"
                        aria-label="Filtrer par statut"
                        @change="onStatusFilterChange"
                    >
                        <option value="">Tous</option>
                        <option
                            v-for="option in STATUS_OPTIONS"
                            :key="option.value"
                            :value="option.value"
                        >
                            {{ option.label }}
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
                        aria-label="Trier les administrateurs"
                        @change="onOrderChange"
                    >
                        <option
                            v-for="option in ADMINISTRATOR_ORDER_OPTIONS"
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
                    <span class="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600">
                        <img
                            v-if="row.image_url"
                            :src="row.image_url"
                            alt=""
                            class="size-full object-cover"
                        >
                        <template v-else>{{ row.initial_name }}</template>
                    </span>
                    <span class="font-semibold text-neutral-950">{{ row.name }}</span>
                </span>
            </template>

            <template #cell-email="{ row, value }">
                <span class="inline-flex items-center gap-1.5">
                    {{ value }}
                    <i
                        v-if="row.email_verified_at"
                        class="fa-solid fa-circle-check text-[11px] text-primary"
                        title="E-mail vérifié"
                        aria-label="E-mail vérifié"
                    />
                </span>
            </template>

            <template #cell-gender="{ row }">
                {{ genderLabel(row.gender) }}
            </template>

            <template #cell-status="{ row }">
                <label class="relative inline-flex">
                    <span class="sr-only">Statut de {{ row.name }}</span>
                    <select
                        :value="pendingStatus[row.id] ?? row.status"
                        :disabled="statusId === row.id || deletingId === row.id"
                        class="h-8 appearance-none rounded-full py-1 pr-7 pl-3 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-wait disabled:opacity-60"
                        :class="statusClass(row.status)"
                        @change="onStatusChange(row, $event)"
                    >
                        <option
                            v-for="option in STATUS_OPTIONS"
                            :key="option.value"
                            :value="option.value"
                        >
                            {{ option.label }}
                        </option>
                    </select>
                    <i
                        class="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[9px] opacity-70"
                        aria-hidden="true"
                    />
                </label>
            </template>

            <template #cell-created_at="{ value }">
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
                    class="inline-flex size-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    :aria-label="`Changer le mot de passe de ${row.name}`"
                    @click="emit('password', row)"
                >
                    <i class="fa-solid fa-key text-xs" aria-hidden="true" />
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
