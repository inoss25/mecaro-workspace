<script setup lang="ts">
import FuelRecordCreateModal from '../../../../fuel-records/components/FuelRecordCreateModal.vue'
import FuelRecordEditModal from '../../../../fuel-records/components/FuelRecordEditModal.vue'
import FuelRecordList from '../../../../fuel-records/components/FuelRecordList.vue'
import type { FuelRecord } from '../../../../fuel-records/types'
import { useVehicleDetail } from '../../../composables/useVehicleDetail'
import { vehicleLabel } from '../../../utils/options'

const { vehicle } = useVehicleDetail()

const createOpen = ref(false)
const editOpen = ref(false)
const selected = ref<FuelRecord | null>(null)

const vehicleId = computed(() => vehicle.value?.id ?? '')

function onEdit(fuelRecord: FuelRecord) {
    selected.value = fuelRecord
    editOpen.value = true
}
</script>

<template>
    <section class="flex flex-col gap-4">
        <div class="flex flex-wrap items-end justify-between gap-3 rounded-[28px] bg-surface p-6 shadow-sm">
            <div>
                <h3 class="text-lg font-semibold text-neutral-950">
                    Carburant
                </h3>
                <p class="mt-1 text-sm text-neutral-500">
                    Pleins pour {{ vehicle ? vehicleLabel(vehicle) : 'ce véhicule' }}.
                </p>
            </div>
            <UiButton size="sm" :disabled="!vehicleId" @click="createOpen = true">
                <template #leading>
                    <i class="fa-solid fa-plus text-xs" />
                </template>
                Nouveau plein
            </UiButton>
        </div>

        <FuelRecordList
            v-if="vehicleId"
            :vehicle-id="vehicleId"
            hide-vehicle-filter
            hide-vehicle-column
            @edit="onEdit"
        />

        <FuelRecordCreateModal
            v-model="createOpen"
            :default-vehicle-id="vehicleId"
            lock-vehicle
        />
        <FuelRecordEditModal
            v-model="editOpen"
            :fuel-record="selected"
            lock-vehicle
        />
    </section>
</template>
