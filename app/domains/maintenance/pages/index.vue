<script setup lang="ts">
const appConfig = useAppConfig()
const localePath = useLocalePath()

useHead({
    title: `Maintenance — ${appConfig.title}`,
})

const sections = [
    { label: 'Interventions', to: '/maintenance-records', icon: 'fa-solid fa-screwdriver-wrench', description: 'Historique des entretiens' },
    { label: 'Catégories', to: '/maintenance-categories', icon: 'fa-solid fa-layer-group', description: 'Familles d’entretien' },
    { label: 'Types', to: '/maintenance-types', icon: 'fa-solid fa-list-check', description: 'Opérations d’entretien' },
    { label: 'Pièces', to: '/maintenance-parts', icon: 'fa-solid fa-gears', description: 'Pièces utilisées' },
    { label: 'Huiles', to: '/maintenance-oils', icon: 'fa-solid fa-oil-can', description: 'Lubrifiants et fluides' },
    { label: 'Intervalles', to: '/maintenance-settings', icon: 'fa-solid fa-gauge-high', description: 'Périodicité par véhicule' },
]
</script>

<template>
    <div class="flex flex-col gap-4">
        <LayoutsSectionPage
            title="Maintenance"
            description="Planifiez et suivez les opérations de maintenance."
        />

        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <NuxtLink
                v-for="section in sections"
                :key="section.to"
                :to="localePath(section.to)"
                class="group flex flex-col rounded-[28px] bg-surface p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
                <span class="flex size-12 items-center justify-center rounded-2xl bg-primary text-white">
                    <i :class="section.icon" />
                </span>
                <span class="mt-5 text-lg font-semibold tracking-tight text-neutral-950">
                    {{ section.label }}
                </span>
                <span class="mt-1 text-sm text-neutral-500">
                    {{ section.description }}
                </span>
            </NuxtLink>
        </div>
    </div>
</template>
