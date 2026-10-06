<script setup lang="ts">
import VehicleTypeCreateModal from '../components/VehicleTypeCreateModal.vue'
import VehicleTypeEditModal from '../components/VehicleTypeEditModal.vue'
import VehicleTypeList from '../components/VehicleTypeList.vue'
import type { VehicleType } from '../types'

const appConfig = useAppConfig()

useHead({
    title: `Types de véhicules — ${appConfig.title}`,
})

const createOpen = ref(false)
const editOpen = ref(false)
const selected = ref<VehicleType | null>(null)

function onEdit(vehicleType: VehicleType) {
    selected.value = vehicleType
    editOpen.value = true
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <LayoutsSectionPage
            title="Types de véhicules"
            description="Définissez les catégories utilisées pour classer les engins."
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

        <VehicleTypeList @edit="onEdit" />

        <VehicleTypeCreateModal v-model="createOpen" />
        <VehicleTypeEditModal
            v-model="editOpen"
            :vehicle-type="selected"
        />
    </div>
</template>
