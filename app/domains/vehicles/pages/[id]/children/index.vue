<script setup lang="ts">
import { useVehicleDetail } from '../../../composables/useVehicleDetail'
import { fuelTypeLabel, vehicleBrandName, vehicleIdentity, vehicleModelName } from '../../../utils/options'

const { vehicle } = useVehicleDetail()

const rows = computed(() => {
    const v = vehicle.value
    if (!v) return []

    return [
        { label: 'Propriétaire', value: v.user.name },
        { label: 'Type', value: v.vehicleType.name },
        { label: 'Marque', value: vehicleBrandName(v) || '—' },
        { label: 'Modèle', value: vehicleModelName(v) || '—' },
        { label: 'Nom affiché', value: v.name?.trim() || '—' },
        { label: 'Immatriculation', value: v.registration_number?.trim() || '—' },
        { label: 'Carburant', value: v.fuel_type ? fuelTypeLabel(v.fuel_type) : '—' },
        { label: 'Couleur', value: v.color?.trim() || '—' },
        { label: 'Cylindrée', value: v.engine_capacity != null ? `${v.engine_capacity} cm³` : '—' },
        { label: 'Transmission', value: v.transmission?.trim() || '—' },
        { label: 'Kilométrage actuel', value: v.current_mileage != null ? `${v.current_mileage} km` : '—' },
        { label: 'Kilométrage initial', value: v.initial_mileage != null ? `${v.initial_mileage} km` : '—' },
        { label: 'Date d\'achat', value: v.purchase_date ? formatDate(v.purchase_date) : '—' },
        { label: 'Année de fabrication', value: formatManufactureYear(v.manufacture_year) },
        { label: 'Créé le', value: formatDate(v.created_at) },
        { label: 'Mis à jour', value: formatDate(v.updated_at) },
    ]
})

function formatManufactureYear(value: string | null | undefined) {
    if (!value) return '—'
    const match = value.match(/^(\d{4})/)
    return match?.[1] ?? value
}
</script>

<template>
    <section class="rounded-[28px] bg-surface p-6 shadow-sm sm:p-8">
        <h3 class="text-lg font-semibold text-neutral-950">
            Vue d'ensemble
        </h3>
        <p class="mt-1 text-sm text-neutral-500">
            {{ vehicle ? vehicleIdentity(vehicle) : '' }}
        </p>

        <dl class="mt-6 grid gap-4 sm:grid-cols-2">
            <div
                v-for="row in rows"
                :key="row.label"
                class="rounded-2xl bg-neutral-50 px-4 py-3"
            >
                <dt class="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    {{ row.label }}
                </dt>
                <dd class="mt-1 text-sm font-semibold text-neutral-900">
                    {{ row.value }}
                </dd>
            </div>
        </dl>
    </section>
</template>
