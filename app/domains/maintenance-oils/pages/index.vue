<script setup lang="ts">
import MaintenanceOilCreateModal from '../components/MaintenanceOilCreateModal.vue'
import MaintenanceOilEditModal from '../components/MaintenanceOilEditModal.vue'
import MaintenanceOilList from '../components/MaintenanceOilList.vue'
import type { MaintenanceOil } from '../types'

const appConfig = useAppConfig()
useHead({ title: `Huiles — ${appConfig.title}` })

const createOpen = ref(false)
const editOpen = ref(false)
const selected = ref<MaintenanceOil | null>(null)

function onEdit(oil: MaintenanceOil) {
    selected.value = oil
    editOpen.value = true
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <LayoutsSectionPage title="Huiles" description="Suivez les lubrifiants utilisés lors des interventions.">
            <template #actions>
                <UiButton size="sm" @click="createOpen = true">
                    <template #leading><i class="fa-solid fa-plus text-xs" /></template>
                    Nouvelle huile
                </UiButton>
            </template>
        </LayoutsSectionPage>
        <MaintenanceOilList @edit="onEdit" />
        <MaintenanceOilCreateModal v-model="createOpen" />
        <MaintenanceOilEditModal v-model="editOpen" :oil="selected" />
    </div>
</template>
