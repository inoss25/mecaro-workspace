<script setup lang="ts">
import VehicleBrandCreateModal from '../components/VehicleBrandCreateModal.vue'
import VehicleBrandEditModal from '../components/VehicleBrandEditModal.vue'
import VehicleBrandList from '../components/VehicleBrandList.vue'
import type { VehicleBrand } from '../types'

const appConfig = useAppConfig()

useHead({
    title: `Marques — ${appConfig.title}`,
})

const createOpen = ref(false)
const editOpen = ref(false)
const selected = ref<VehicleBrand | null>(null)

function onEdit(vehicleBrand: VehicleBrand) {
    selected.value = vehicleBrand
    editOpen.value = true
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <LayoutsSectionPage
            title="Marques"
            description="Gérez les marques de véhicules et leurs logos."
        >
            <template #actions>
                <UiButton size="sm" @click="createOpen = true">
                    <template #leading>
                        <i class="fa-solid fa-plus text-xs" />
                    </template>
                    Nouvelle marque
                </UiButton>
            </template>
        </LayoutsSectionPage>

        <VehicleBrandList @edit="onEdit" />

        <VehicleBrandCreateModal v-model="createOpen" />
        <VehicleBrandEditModal
            v-model="editOpen"
            :vehicle-brand="selected"
        />
    </div>
</template>
