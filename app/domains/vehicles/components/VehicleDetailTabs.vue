<script setup lang="ts">
const props = defineProps<{
    vehicleId: string
}>()

const localePath = useLocalePath()
const route = useRoute()

const tabs = computed(() => [
    { key: 'overview', label: 'Vue d\'ensemble', to: localePath(`/vehicles/${props.vehicleId}`) },
    { key: 'edit', label: 'Modifier', to: localePath(`/vehicles/${props.vehicleId}/edit`) },
    { key: 'maintenances', label: 'Entretiens', to: localePath(`/vehicles/${props.vehicleId}/maintenances`) },
    { key: 'fuel-records', label: 'Carburant', to: localePath(`/vehicles/${props.vehicleId}/fuel-records`) },
])

function normalizePath(path: string) {
    return path.replace(/\/+$/, '') || '/'
}

function isActive(tab: { to: string }) {
    return normalizePath(route.path) === normalizePath(tab.to)
}
</script>

<template>
    <nav
        class="flex flex-wrap gap-2"
        aria-label="Sections du véhicule"
    >
        <NuxtLink
            v-for="tab in tabs"
            :key="tab.key"
            :to="tab.to"
            class="inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            :class="isActive(tab)
                ? 'bg-primary text-white shadow-sm'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'"
            :aria-current="isActive(tab) ? 'page' : undefined"
        >
            {{ tab.label }}
        </NuxtLink>
    </nav>
</template>
