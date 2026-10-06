<script setup lang="ts">
import { mainNav } from '~/components/layouts/nav'

const appConfig = useAppConfig()
const { userName } = useAuthUser()

const welcome = computed(() => userName.value ? `Bienvenue, ${userName.value}` : 'Bienvenue')

useHead({
    title: `Tableau de bord — ${appConfig.title}`,
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
                    Accédez aux sections de l’atelier.
                </p>
                <div class="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium">
                    <span class="size-2 rounded-full bg-tertiary" />
                    Espace administrateur
                </div>
            </div>
        </section>

        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <NuxtLink
                v-for="item in mainNav"
                :key="item.to"
                :to="item.to"
                class="group flex flex-col rounded-[28px] bg-surface p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
                <span class="flex size-12 items-center justify-center rounded-2xl bg-primary text-white">
                    <i :class="item.icon" />
                </span>
                <span class="mt-5 text-lg font-semibold tracking-tight text-neutral-950">
                    {{ item.label }}
                </span>
                <span class="mt-1 text-sm text-neutral-500">
                    {{ item.description }}
                </span>
                <span class="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    Ouvrir
                    <i class="fa-solid fa-arrow-right text-xs transition-transform group-hover:translate-x-0.5" />
                </span>
            </NuxtLink>
        </div>
    </div>
</template>
