<script setup lang="ts">
import MaintenancePartCreateModal from '../components/MaintenancePartCreateModal.vue'
import MaintenancePartEditModal from '../components/MaintenancePartEditModal.vue'
import MaintenancePartList from '../components/MaintenancePartList.vue'
import type { MaintenancePart } from '../types'

const appConfig = useAppConfig()
useHead({ title: `Pièces — ${appConfig.title}` })

const createOpen = ref(false)
const editOpen = ref(false)
const selected = ref<MaintenancePart | null>(null)

function onEdit(part: MaintenancePart) {
    selected.value = part
    editOpen.value = true
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <LayoutsSectionPage title="Pièces" description="Suivez les pièces utilisées lors des interventions.">
            <template #actions>
                <UiButton size="sm" @click="createOpen = true">
                    <template #leading><i class="fa-solid fa-plus text-xs" /></template>
                    Nouvelle pièce
                </UiButton>
            </template>
        </LayoutsSectionPage>
        <MaintenancePartList @edit="onEdit" />
        <MaintenancePartCreateModal v-model="createOpen" />
        <MaintenancePartEditModal v-model="editOpen" :part="selected" />
    </div>
</template>
