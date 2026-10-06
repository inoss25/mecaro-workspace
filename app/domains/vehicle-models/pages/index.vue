<script setup lang="ts">
import VehicleModelCreateModal from '../components/VehicleModelCreateModal.vue'
import VehicleModelEditModal from '../components/VehicleModelEditModal.vue'
import VehicleModelList from '../components/VehicleModelList.vue'
import type { VehicleModel } from '../types'

const appConfig = useAppConfig()

useHead({
    title: `Modèles — ${appConfig.title}`,
})

const createOpen = ref(false)
const editOpen = ref(false)
const selected = ref<VehicleModel | null>(null)

function onEdit(vehicleModel: VehicleModel) {
    selected.value = vehicleModel
    editOpen.value = true
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <LayoutsSectionPage
            title="Modèles"
            description="Gérez les modèles associés à chaque marque."
        >
            <template #actions>
                <UiButton size="sm" @click="createOpen = true">
                    <template #leading>
                        <i class="fa-solid fa-plus text-xs" />
                    </template>
                    Nouveau modèle
                </UiButton>
            </template>
        </LayoutsSectionPage>

        <VehicleModelList @edit="onEdit" />

        <VehicleModelCreateModal v-model="createOpen" />
        <VehicleModelEditModal
            v-model="editOpen"
            :vehicle-model="selected"
        />
    </div>
</template>
