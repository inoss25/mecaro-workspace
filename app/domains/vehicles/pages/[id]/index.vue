<script setup lang="ts">
import VehicleDetailHeader from '../../components/VehicleDetailHeader.vue'
import VehicleDetailTabs from '../../components/VehicleDetailTabs.vue'
import { provideVehicleDetail } from '../../composables/useVehicleDetail'
import { useVehicleStore } from '../../stores/vehicleStore'
import type { Vehicle } from '../../types'
import { vehicleLabel } from '../../utils/options'

const appConfig = useAppConfig()
const route = useRoute()
const store = useVehicleStore()

const id = computed(() => String(route.params.id ?? ''))
const vehicle = ref<Vehicle | null>(null)
const loading = ref(true)
const error = ref<unknown>(null)

async function refresh() {
    if (!id.value) return
    loading.value = true
    error.value = null
    try {
        vehicle.value = await store.find(id.value)
        if (!vehicle.value) error.value = new Error('Véhicule introuvable.')
    }
    catch (cause) {
        error.value = cause
        vehicle.value = null
    }
    finally {
        loading.value = false
    }
}

watch(id, () => {
    void refresh()
}, { immediate: true })

provideVehicleDetail({ id, vehicle, loading, error, refresh })

const pageTitle = computed(() => {
    if (vehicle.value) return `${vehicleLabel(vehicle.value)} — ${appConfig.title}`
    return `Véhicule — ${appConfig.title}`
})

useHead({
    title: pageTitle,
})

const errorMessage = computed(() => error.value ? extractErrorMessage(error.value) : '')
</script>

<template>
    <div class="flex flex-col gap-4">
        <p
            v-if="errorMessage && !loading"
            class="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
        >
            <span>{{ errorMessage }}</span>
            <button
                type="button"
                class="font-semibold text-red-800 underline-offset-2 hover:underline"
                @click="refresh()"
            >
                Réessayer
            </button>
        </p>

        <div v-if="loading" class="rounded-[28px] bg-surface p-8 shadow-sm">
            <div class="flex items-center gap-3 text-sm text-neutral-500">
                <span class="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden="true" />
                Chargement du véhicule…
            </div>
        </div>

        <template v-else-if="vehicle">
            <VehicleDetailHeader :vehicle="vehicle" />

            <div class="rounded-[28px] bg-surface p-4 shadow-sm sm:p-6">
                <VehicleDetailTabs :vehicle-id="vehicle.id" />
            </div>

            <NuxtPage />
        </template>
    </div>
</template>
