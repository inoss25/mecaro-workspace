<script setup lang="ts">
import { isNavItemActive, navSections } from './nav'

const appConfig = useAppConfig()
const route = useRoute()
const { sidebarOpen, closeSidebar } = useAppShell()
const { userName, userInitials } = useAuthUser()
const accountName = computed(() => userName.value || 'Administrateur')
</script>

<template>
    <div v-if="sidebarOpen" class="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden"
        @click="closeSidebar" />

    <aside id="app-sidebar"
        class="fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col bg-primary text-white shadow-xl shadow-black/20 transition-transform duration-200 lg:static lg:z-auto lg:shadow-none"
        :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'">
        <div class="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4">
            <div class="flex items-center gap-3">
                <span class="flex size-9 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                    <i class="fa-solid fa-car-side text-sm" />
                </span>
                <span class="text-lg font-semibold tracking-tight">{{ appConfig.title }}</span>
            </div>
            <button type="button"
                class="inline-flex size-9 items-center justify-center rounded-xl text-white/80 hover:bg-white/10 lg:hidden"
                aria-label="Fermer le menu" @click="closeSidebar">
                <i class="fa-solid fa-xmark" />
            </button>
        </div>

        <nav class="sidebar-scroll flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 py-3" aria-label="Menu principal">
            <div v-for="section in navSections" :key="section.label" class="flex flex-col gap-1">
                <p class="px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                    {{ section.label }}
                </p>
                <NuxtLink v-for="item in section.items" :key="item.to" :to="item.to"
                    class="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                    :class="isNavItemActive(route.path, item.to)
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-white/75 hover:bg-white/10 hover:text-white'"
                    :aria-current="isNavItemActive(route.path, item.to) ? 'page' : undefined">
                    <i class="w-4 text-center text-sm" :class="item.icon" />
                    <span>{{ item.label }}</span>
                </NuxtLink>
            </div>
        </nav>

        <div class="shrink-0 border-t border-white/10 p-3">
            <NuxtLink to="/profil"
                class="flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-3 transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70">
                <span
                    class="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-primary">
                    {{ userInitials }}
                </span>
                <div class="min-w-0">
                    <p class="truncate text-sm font-semibold">{{ accountName }}</p>
                    <p class="mt-0.5 flex items-center gap-1.5 text-xs text-white/65">
                        <span class="size-1.5 rounded-full bg-tertiary" />
                        En ligne
                    </p>
                </div>
            </NuxtLink>
        </div>
    </aside>
</template>

<style scoped>
.sidebar-scroll {
    scrollbar-width: thin;
    scrollbar-color: rgb(255 255 255 / 0.32) transparent;
}

.sidebar-scroll::-webkit-scrollbar {
    width: 10px;
}

.sidebar-scroll::-webkit-scrollbar-track {
    margin-block: 10px;
    background: transparent;
}

.sidebar-scroll::-webkit-scrollbar-thumb {
    border: 3px solid transparent;
    border-radius: 999px;
    background-color: rgb(255 255 255 / 0.32);
    background-clip: padding-box;
}

.sidebar-scroll::-webkit-scrollbar-thumb:hover {
    background-color: rgb(255 255 255 / 0.55);
}
</style>
