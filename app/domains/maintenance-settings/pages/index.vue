<script setup lang="ts">
import MaintenanceSettingCreateModal from '../components/MaintenanceSettingCreateModal.vue'
import MaintenanceSettingEditModal from '../components/MaintenanceSettingEditModal.vue'
import MaintenanceSettingList from '../components/MaintenanceSettingList.vue'
import type { MaintenanceSetting } from '../types'

const appConfig = useAppConfig()
useHead({ title: `Intervalles — ${appConfig.title}` })

const createOpen = ref(false)
const editOpen = ref(false)
const selected = ref<MaintenanceSetting | null>(null)

function onEdit(setting: MaintenanceSetting) {
    selected.value = setting
    editOpen.value = true
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <LayoutsSectionPage title="Intervalles" description="Définissez tous les combien de kilomètres un entretien doit revenir.">
            <template #actions>
                <UiButton size="sm" @click="createOpen = true">
                    <template #leading><i class="fa-solid fa-plus text-xs" /></template>
                    Nouvel intervalle
                </UiButton>
            </template>
        </LayoutsSectionPage>
        <MaintenanceSettingList @edit="onEdit" />
        <MaintenanceSettingCreateModal v-model="createOpen" />
        <MaintenanceSettingEditModal v-model="editOpen" :setting="selected" />
    </div>
</template>
