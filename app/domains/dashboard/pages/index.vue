<script setup lang="ts">
import DashboardMonthChart from '../components/DashboardMonthChart.vue'
import { useDashboardStore } from '../stores/dashboardStore'
import { formatCount, formatDashboardDate } from '../utils/display'

const appConfig = useAppConfig()
const { userName } = useAuthUser()
const store = useDashboardStore()

const welcome = computed(() => userName.value ? `Bienvenue, ${userName.value}` : 'Bienvenue')
const errorMessage = computed(() => store.error ? extractErrorMessage(store.error) : '')
const showSkeleton = computed(() => store.loading && !store.stats)

const statCards = computed(() => [
    {
        label: 'Véhicules',
        value: store.stats?.total_vehicles ?? 0,
        to: '/vehicles',
        icon: 'fa-solid fa-car',
    },
    {
        label: 'Utilisateurs',
        value: store.stats?.total_users ?? 0,
        to: '/users',
        icon: 'fa-solid fa-users',
    },
    {
        label: 'Pleins',
        value: store.stats?.total_fuel_records ?? 0,
        to: '/fuel-records',
        icon: 'fa-solid fa-gas-pump',
    },
    {
        label: 'Entretiens',
        value: store.stats?.total_maintenance_records ?? 0,
        to: '/maintenance-records',
        icon: 'fa-solid fa-screwdriver-wrench',
    },
])

const userPoints = computed(() => store.userChart.map(point => ({
    month: point.month,
    value: point.users,
})))

const maintenancePoints = computed(() => store.maintenanceChart.map(point => ({
    month: point.month,
    value: point.records,
})))

useHead({
    title: `Tableau de bord — ${appConfig.title}`,
})

onMounted(() => {
    void store.fetchDashboard()
})
</script>

<template>
    <div class="flex flex-col gap-4">
        <section class="relative overflow-hidden rounded-[32px] bg-primary px-6 py-8 text-white sm:px-8 sm:py-10">
            <div class="pointer-events-none absolute -right-12 -top-16 size-56 rounded-full bg-white/10" />
            <div class="pointer-events-none absolute -bottom-20 left-1/3 size-44 rounded-full bg-black/10" />

            <div class="relative">
                <div class="mb-6 flex items-center gap-3">
                    <span class="h-0.5 w-8 rounded-full bg-white" />
                    <span class="size-1.5 rounded-full bg-white/50" />
                    <span class="size-1.5 rounded-full bg-white/30" />
                </div>
                <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
                    Tableau de bord
                </p>
                <h2 class="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                    {{ welcome }}
                </h2>
                <p class="mt-3 max-w-md text-sm leading-relaxed text-white/80">
                    Activité du parc sur les douze derniers mois.
                </p>
            </div>
        </section>

        <p v-if="errorMessage"
            class="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert">
            <span>{{ errorMessage }}</span>
            <button type="button" class="font-semibold text-red-800 underline-offset-2 hover:underline"
                @click="store.fetchDashboard()">
                Réessayer
            </button>
        </p>

        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <NuxtLink v-for="card in statCards" :key="card.label" :to="card.to"
                class="flex items-center gap-4 rounded-[28px] bg-surface p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                <span class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-white">
                    <i :class="card.icon" />
                </span>
                <span class="min-w-0">
                    <span class="block text-sm text-neutral-500">{{ card.label }}</span>
                    <span v-if="showSkeleton" class="mt-2 block h-7 w-16 animate-pulse rounded-lg bg-neutral-100" />
                    <span v-else class="mt-1 block text-2xl font-semibold tracking-tight text-neutral-950">
                        {{ formatCount(card.value) }}
                    </span>
                </span>
            </NuxtLink>
        </div>

        <div class="grid gap-4 xl:grid-cols-2">
            <DashboardMonthChart title="Nouveaux utilisateurs" description="Comptes créés, mois par mois."
                series-name="Utilisateurs" color="#166534" aria-label="Nombre d’utilisateurs créés par mois"
                :loading="store.loading && !userPoints.length" :points="userPoints" />
            <DashboardMonthChart title="Entretiens" description="Interventions enregistrées, mois par mois."
                series-name="Entretiens" color="#186295" aria-label="Nombre d’entretiens enregistrés par mois"
                :loading="store.loading && !maintenancePoints.length" :points="maintenancePoints" />
        </div>

        <div class="grid gap-4 xl:grid-cols-2">
            <section class="rounded-[28px] bg-surface p-5 shadow-sm sm:p-6">
                <div class="mb-4 flex items-end justify-between gap-3">
                    <div>
                        <h3 class="text-lg font-semibold tracking-tight text-neutral-950">
                            Derniers utilisateurs
                        </h3>
                        <p class="mt-1 text-sm text-neutral-500">
                            Comptes les plus récents.
                        </p>
                    </div>
                    <NuxtLink to="/users" class="text-sm font-semibold text-primary hover:underline">
                        Voir tout
                    </NuxtLink>
                </div>

                <ul v-if="store.newestUsers.length" class="flex flex-col divide-y divide-neutral-100">
                    <li v-for="user in store.newestUsers" :key="user.id"
                        class="flex items-center justify-between gap-3 py-3">
                        <div class="min-w-0">
                            <p class="truncate text-sm font-semibold text-neutral-950">
                                {{ user.name }}
                            </p>
                            <p class="truncate text-sm text-neutral-500">
                                {{ user.email || 'Sans e-mail' }}
                            </p>
                        </div>
                        <p class="shrink-0 text-xs text-neutral-500">
                            {{ formatDashboardDate(user.created_at) }}
                        </p>
                    </li>
                </ul>
                <p v-else-if="showSkeleton" class="space-y-3">
                    <span v-for="index in 4" :key="index" class="block h-10 animate-pulse rounded-xl bg-neutral-100" />
                </p>
                <p v-else class="text-sm text-neutral-500">
                    Aucun utilisateur pour le moment.
                </p>
            </section>

            <section class="rounded-[28px] bg-surface p-5 shadow-sm sm:p-6">
                <div class="mb-4 flex items-end justify-between gap-3">
                    <div>
                        <h3 class="text-lg font-semibold tracking-tight text-neutral-950">
                            Derniers entretiens
                        </h3>
                        <p class="mt-1 text-sm text-neutral-500">
                            Interventions les plus récentes.
                        </p>
                    </div>
                    <NuxtLink to="/maintenance-records" class="text-sm font-semibold text-primary hover:underline">
                        Voir tout
                    </NuxtLink>
                </div>

                <ul v-if="store.newestMaintenanceRecords.length" class="flex flex-col divide-y divide-neutral-100">
                    <li v-for="record in store.newestMaintenanceRecords" :key="record.id" class="py-3">
                        <NuxtLink :to="`/vehicles/${record.vehicle_id}/maintenances`"
                            class="flex items-start justify-between gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                            <p class="line-clamp-2 text-sm font-medium text-neutral-950">
                                {{ record.description || 'Sans description' }}
                            </p>
                            <p class="shrink-0 text-xs text-neutral-500">
                                {{ formatDashboardDate(record.created_at) }}
                            </p>
                        </NuxtLink>
                    </li>
                </ul>
                <p v-else-if="showSkeleton" class="space-y-3">
                    <span v-for="index in 4" :key="index" class="block h-10 animate-pulse rounded-xl bg-neutral-100" />
                </p>
                <p v-else class="text-sm text-neutral-500">
                    Aucun entretien pour le moment.
                </p>
            </section>
        </div>
    </div>
</template>
