<script setup lang="ts">
import MaintenanceTypeCreateModal from '../components/MaintenanceTypeCreateModal.vue'
import MaintenanceTypeEditModal from '../components/MaintenanceTypeEditModal.vue'
import MaintenanceTypeList from '../components/MaintenanceTypeList.vue'
import type { MaintenanceType } from '../types'

const appConfig = useAppConfig()

useHead({
    title: `Types de maintenance — ${appConfig.title}`,
})

const createOpen = ref(false)
const editOpen = ref(false)
const selected = ref<MaintenanceType | null>(null)

function onEdit(maintenanceType: MaintenanceType) {
    selected.value = maintenanceType
    editOpen.value = true
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <LayoutsSectionPage
            title="Types de maintenance"
            description="Définissez les opérations d’entretien proposées à l’atelier."
        >
            <template #actions>
                <UiButton size="sm" @click="createOpen = true">
                    <template #leading>
                        <i class="fa-solid fa-plus text-xs" />
                    </template>
                    Nouveau type
                </UiButton>
            </template>
        </LayoutsSectionPage>

        <MaintenanceTypeList @edit="onEdit" />

        <MaintenanceTypeCreateModal v-model="createOpen" />
        <MaintenanceTypeEditModal v-model="editOpen" :maintenance-type="selected" />
    </div>
</template>
