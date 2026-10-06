<script setup lang="ts">
import MaintenanceRecordCreateModal from '../../../../maintenance-records/components/MaintenanceRecordCreateModal.vue'
import MaintenanceRecordEditModal from '../../../../maintenance-records/components/MaintenanceRecordEditModal.vue'
import MaintenanceRecordList from '../../../../maintenance-records/components/MaintenanceRecordList.vue'
import type { MaintenanceRecord } from '../../../../maintenance-records/types'
import { useVehicleDetail } from '../../../composables/useVehicleDetail'
import { vehicleLabel } from '../../../utils/options'

const { vehicle } = useVehicleDetail()

const createOpen = ref(false)
const editOpen = ref(false)
const selected = ref<MaintenanceRecord | null>(null)
const vehicleId = computed(() => vehicle.value?.id ?? '')

function onEdit(record: MaintenanceRecord) {
    selected.value = record
    editOpen.value = true
}
</script>

<template>
    <section class="flex flex-col gap-4">
        <div class="flex flex-wrap items-end justify-between gap-3 rounded-[28px] bg-surface p-6 shadow-sm">
            <div>
                <h3 class="text-lg font-semibold text-neutral-950">
                    Entretiens
                </h3>
                <p class="mt-1 text-sm text-neutral-500">
                    Interventions pour {{ vehicle ? vehicleLabel(vehicle) : 'ce véhicule' }}.
                </p>
            </div>
            <UiButton size="sm" :disabled="!vehicleId" @click="createOpen = true">
                <template #leading>
                    <i class="fa-solid fa-plus text-xs" />
                </template>
                Nouvelle intervention
            </UiButton>
        </div>

        <MaintenanceRecordList
            v-if="vehicleId"
            :vehicle-id="vehicleId"
            hide-vehicle-filter
            hide-vehicle-column
            @edit="onEdit"
        />

        <MaintenanceRecordCreateModal
            v-model="createOpen"
            :default-vehicle-id="vehicleId"
            lock-vehicle
        />
        <MaintenanceRecordEditModal
            v-model="editOpen"
            :record="selected"
            lock-vehicle
        />
    </section>
</template>
