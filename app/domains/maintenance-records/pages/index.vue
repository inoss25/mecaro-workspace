<script setup lang="ts">
import MaintenanceRecordCreateModal from '../components/MaintenanceRecordCreateModal.vue'
import MaintenanceRecordEditModal from '../components/MaintenanceRecordEditModal.vue'
import MaintenanceRecordList from '../components/MaintenanceRecordList.vue'
import type { MaintenanceRecord } from '../types'

const appConfig = useAppConfig()

useHead({
    title: `Interventions — ${appConfig.title}`,
})

const createOpen = ref(false)
const editOpen = ref(false)
const selected = ref<MaintenanceRecord | null>(null)

function onEdit(record: MaintenanceRecord) {
    selected.value = record
    editOpen.value = true
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <LayoutsSectionPage
            title="Interventions"
            description="Suivez les entretiens, le kilométrage et le coût du parc."
        >
            <template #actions>
                <UiButton size="sm" @click="createOpen = true">
                    <template #leading>
                        <i class="fa-solid fa-plus text-xs" />
                    </template>
                    Nouvelle intervention
                </UiButton>
            </template>
        </LayoutsSectionPage>

        <MaintenanceRecordList @edit="onEdit" />

        <MaintenanceRecordCreateModal v-model="createOpen" />
        <MaintenanceRecordEditModal v-model="editOpen" :record="selected" />
    </div>
</template>
