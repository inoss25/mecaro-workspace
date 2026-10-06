<script setup lang="ts">
import VehicleList from '../components/VehicleList.vue'

const appConfig = useAppConfig()
const localePath = useLocalePath()

useHead({
    title: `Véhicules — ${appConfig.title}`,
})

function onOpen(vehicleId: string) {
    void navigateTo(localePath(`/vehicles/${vehicleId}`))
}

function onEdit(vehicleId: string) {
    void navigateTo(localePath(`/vehicles/${vehicleId}/edit`))
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <LayoutsSectionPage
            title="Véhicules"
            description="Gérez le parc, les immatriculations et le carburant."
        >
            <template #actions>
                <UiButton size="sm" :to="localePath('/vehicles/create')">
                    <template #leading>
                        <i class="fa-solid fa-plus text-xs" />
                    </template>
                    Nouveau véhicule
                </UiButton>
            </template>
        </LayoutsSectionPage>

        <VehicleList @open="onOpen" @edit="onEdit" />
    </div>
</template>
