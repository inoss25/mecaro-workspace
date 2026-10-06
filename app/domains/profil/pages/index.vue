<script setup lang="ts">
const appConfig = useAppConfig()

useHead({
    title: `Profil — ${appConfig.title}`,
})

const fields = [
    { label: 'Nom', value: 'Administrateur' },
    { label: 'Rôle', value: 'Administrateur' },
    { label: 'E-mail', value: 'Non renseigné' },
    { label: 'Statut', value: 'En ligne' },
]
</script>

<template>
    <div class="flex flex-col gap-4">
        <LayoutsSectionPage
            title="Profil"
            description="Identité du compte connecté à l’espace administrateur."
        />

        <section class="rounded-[28px] bg-surface p-6 shadow-sm sm:p-8">
            <div class="flex items-center gap-4">
                <span class="flex size-14 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">
                    A
                </span>
                <div class="min-w-0">
                    <p class="truncate text-lg font-semibold tracking-tight text-neutral-950">
                        Administrateur
                    </p>
                    <p class="mt-1 flex items-center gap-1.5 text-sm text-neutral-500">
                        <span class="size-1.5 rounded-full bg-tertiary" />
                        En ligne
                    </p>
                </div>
            </div>

            <dl class="mt-8 grid gap-3 sm:grid-cols-2">
                <div
                    v-for="field in fields"
                    :key="field.label"
                    class="rounded-2xl bg-neutral-100 px-4 py-3"
                >
                    <dt class="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        {{ field.label }}
                    </dt>
                    <dd class="mt-1 text-sm font-semibold text-neutral-950">
                        {{ field.value }}
                    </dd>
                </div>
            </dl>
        </section>
    </div>
</template>
