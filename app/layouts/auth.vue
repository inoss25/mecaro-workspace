<script setup lang="ts">
const appConfig = useAppConfig()

const tags = [
    { label: 'En retard', class: 'left-8 top-8' },
    { label: 'Pièce manquante', class: 'left-[38%] top-6' },
    { label: 'Devis perdu', class: 'right-10 top-14' },
    { label: 'Client en attente', class: 'left-12 top-[46%]' },
    { label: 'Facture oubliée', class: 'left-[40%] top-[58%]' },
    { label: 'Rappel manqué', class: 'right-12 top-[42%]' },
]
</script>

<template>
    <div class="min-h-screen bg-primary lg:grid lg:grid-cols-2">
        <aside class="relative hidden overflow-hidden px-12 py-12 text-white lg:flex lg:flex-col xl:px-16">
            <div class="pointer-events-none absolute -left-24 top-24 size-72 rounded-full bg-white/5" />
            <div class="pointer-events-none absolute -right-10 bottom-10 size-56 rounded-full bg-black/10" />

            <div class="relative flex items-center gap-3">
                <span class="flex size-9 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                    <i class="fa-solid fa-car-side text-sm" />
                </span>
                <span class="text-lg font-semibold tracking-tight">{{ appConfig.title }}</span>
            </div>

            <div class="relative my-auto max-w-lg pt-10">
                <div class="mb-8 flex items-center gap-3">
                    <span class="h-0.5 w-8 rounded-full bg-white" />
                    <span class="size-1.5 rounded-full bg-white/50" />
                    <span class="size-1.5 rounded-full bg-white/30" />
                </div>

                <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
                    Étape 1/3
                </p>
                <h2 class="mt-3 text-4xl font-semibold tracking-tight">
                    Le problème
                </h2>
                <p class="mt-4 max-w-md text-base leading-relaxed text-white/80">
                    Les ateliers reçoivent trop de véhicules… mais n’en gardent aucune trace.
                </p>

                <div class="relative mt-10 h-56 overflow-hidden rounded-[28px] bg-white/10 backdrop-blur-sm">
                    <span
                        v-for="tag in tags"
                        :key="tag.label"
                        class="absolute rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#404040] shadow-sm"
                        :class="tag.class"
                    >
                        {{ tag.label }}
                    </span>
                    <div class="absolute bottom-5 right-6 flex items-center gap-2 text-xs text-white/80">
                        <span class="size-2 rounded-full bg-tertiary" />
                        Aucune trace
                    </div>
                </div>
            </div>

            <p class="relative mt-10 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                Atelier dispersé
                <i class="fa-solid fa-arrow-right ml-2 text-[10px]" />
            </p>
        </aside>

        <main class="relative flex min-h-screen flex-col bg-surface lg:rounded-l-[5rem]">
            <div class="flex items-center gap-2.5 px-6 pt-8 lg:hidden">
                <span class="flex size-9 items-center justify-center rounded-xl bg-primary text-white">
                    <i class="fa-solid fa-car-side text-sm" />
                </span>
                <span class="text-lg font-semibold tracking-tight text-neutral-900">{{ appConfig.title }}</span>
            </div>

            <div class="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
                <div class="w-full max-w-[400px]">
                    <slot />
                </div>
            </div>
        </main>
    </div>
</template>
