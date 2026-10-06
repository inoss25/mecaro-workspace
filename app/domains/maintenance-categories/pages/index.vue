<script setup lang="ts">
import MaintenanceCategoryCreateModal from '../components/MaintenanceCategoryCreateModal.vue'
import MaintenanceCategoryEditModal from '../components/MaintenanceCategoryEditModal.vue'
import MaintenanceCategoryList from '../components/MaintenanceCategoryList.vue'
import type { MaintenanceCategory } from '../types'

const appConfig = useAppConfig()

useHead({
    title: `Catégories de maintenance — ${appConfig.title}`,
})

const createOpen = ref(false)
const editOpen = ref(false)
const selected = ref<MaintenanceCategory | null>(null)

function onEdit(category: MaintenanceCategory) {
    selected.value = category
    editOpen.value = true
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <LayoutsSectionPage
            title="Catégories de maintenance"
            description="Regroupez les types d’entretien par famille."
        >
            <template #actions>
                <UiButton size="sm" @click="createOpen = true">
                    <template #leading>
                        <i class="fa-solid fa-plus text-xs" />
                    </template>
                    Nouvelle catégorie
                </UiButton>
            </template>
        </LayoutsSectionPage>

        <MaintenanceCategoryList @edit="onEdit" />

        <MaintenanceCategoryCreateModal v-model="createOpen" />
        <MaintenanceCategoryEditModal v-model="editOpen" :category="selected" />
    </div>
</template>
