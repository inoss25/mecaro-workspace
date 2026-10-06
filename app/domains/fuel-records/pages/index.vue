<script setup lang="ts">
import FuelRecordCreateModal from '../components/FuelRecordCreateModal.vue'
import FuelRecordEditModal from '../components/FuelRecordEditModal.vue'
import FuelRecordList from '../components/FuelRecordList.vue'
import type { FuelRecord } from '../types'

const appConfig = useAppConfig()

useHead({
    title: `Carburant — ${appConfig.title}`,
})

const createOpen = ref(false)
const editOpen = ref(false)
const selected = ref<FuelRecord | null>(null)

function onEdit(fuelRecord: FuelRecord) {
    selected.value = fuelRecord
    editOpen.value = true
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <LayoutsSectionPage
            title="Carburant"
            description="Suivez les pleins, les montants et le kilométrage du parc."
        >
            <template #actions>
                <UiButton size="sm" @click="createOpen = true">
                    <template #leading>
                        <i class="fa-solid fa-plus text-xs" />
                    </template>
                    Nouveau plein
                </UiButton>
            </template>
        </LayoutsSectionPage>

        <FuelRecordList @edit="onEdit" />

        <FuelRecordCreateModal v-model="createOpen" />
        <FuelRecordEditModal v-model="editOpen" :fuel-record="selected" />
    </div>
</template>
