<script setup lang="ts">
import type { Vehicle } from '../types'
import { fuelTypeClass, fuelTypeLabel, vehicleIdentity, vehicleImageSrc, vehicleLabel } from '../utils/options'

const props = defineProps<{
    vehicle: Vehicle
}>()

const localePath = useLocalePath()
const config = useRuntimeConfig()

const imageSrc = computed(() => vehicleImageSrc(props.vehicle.image_path, config.public.apiBaseUrl as string))
</script>

<template>
    <div class="rounded-[28px] bg-surface p-6 shadow-sm sm:p-8">
        <div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex min-w-0 items-center gap-4">
                <span class="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-neutral-100 text-neutral-400">
                    <img
                        v-if="imageSrc"
                        :src="imageSrc"
                        alt=""
                        class="size-full object-cover"
                    >
                    <i v-else class="fa-solid fa-car text-xl" aria-hidden="true" />
                </span>
                <div class="min-w-0">
                    <p class="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                        Véhicule
                    </p>
                    <h2 class="truncate text-2xl font-semibold text-neutral-950">
                        {{ vehicleLabel(vehicle) }}
                    </h2>
                    <p v-if="vehicleIdentity(vehicle)" class="truncate text-sm text-neutral-500">
                        {{ vehicleIdentity(vehicle) }}
                    </p>
                    <p v-if="vehicle.registration_number" class="mt-1 text-sm font-medium text-neutral-700">
                        {{ vehicle.registration_number }}
                    </p>
                </div>
            </div>

            <div class="flex flex-wrap items-center gap-2">
                <span
                    v-if="vehicle.fuel_type"
                    class="inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold"
                    :class="fuelTypeClass(vehicle.fuel_type)"
                >
                    {{ fuelTypeLabel(vehicle.fuel_type) }}
                </span>
                <span
                    class="inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold"
                    :class="vehicle.is_active ? 'bg-primary/10 text-primary' : 'bg-neutral-100 text-neutral-600'"
                >
                    {{ vehicle.is_active ? 'Actif' : 'Inactif' }}
                </span>
                <UiButton variant="outline" size="sm" :to="localePath('/vehicles')">
                    Retour à la liste
                </UiButton>
            </div>
        </div>
    </div>
</template>
