<script setup lang="ts">
import { mainNav, type AppNavItem } from './nav'

const route = useRoute()
const { toggleSidebar, sidebarOpen } = useAppShell()
const { isDark, toggleColorMode, setPreference, colorMode } = useAppColorMode()
const { confirm } = useAlert()
const { userName, userInitials } = useAuthUser()
const accountName = computed(() => userName.value || 'Administrateur')

const query = ref('')
const searchOpen = ref(false)
const activeIndex = ref(0)
const searchRef = ref<HTMLInputElement | null>(null)
const searchRoot = ref<HTMLElement | null>(null)
const accountOpen = ref(false)

const appearance = [
    { value: 'light', label: 'Clair', icon: 'fa-regular fa-sun' },
    { value: 'dark', label: 'Sombre', icon: 'fa-regular fa-moon' },
    { value: 'system', label: 'Système', icon: 'fa-solid fa-desktop' },
] as const

const shortcutLabel = ref('Ctrl K')

const results = computed(() => {
    const term = query.value.trim().toLocaleLowerCase('fr')
    if (!term) return []
    return mainNav.filter(item =>
        item.label.toLocaleLowerCase('fr').includes(term)
        || item.description.toLocaleLowerCase('fr').includes(term),
    )
})

const showResults = computed(() => searchOpen.value && query.value.trim().length > 0)

watch(query, () => {
    activeIndex.value = 0
    searchOpen.value = query.value.trim().length > 0
})

watch(() => route.fullPath, () => {
    query.value = ''
    searchOpen.value = false
    accountOpen.value = false
})

onClickOutside(searchRoot, () => {
    searchOpen.value = false
})

function onSearchKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
        event.stopPropagation()
        searchOpen.value = false
        searchRef.value?.blur()
        return
    }

    if (!results.value.length) return

    if (event.key === 'ArrowDown') {
        event.preventDefault()
        activeIndex.value = (activeIndex.value + 1) % results.value.length
    }
    else if (event.key === 'ArrowUp') {
        event.preventDefault()
        activeIndex.value = (activeIndex.value - 1 + results.value.length) % results.value.length
    }
}

async function openResult(item: AppNavItem) {
    searchOpen.value = false
    query.value = ''
    await navigateTo(item.to)
}

function onSearchSubmit() {
    const item = results.value[activeIndex.value] ?? results.value[0]
    if (item) openResult(item)
}

function onGlobalKeydown(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.value?.focus()
        searchRef.value?.select()
    }
}

async function openAccountLink(to: string) {
    accountOpen.value = false
    await navigateTo(to)
}

async function logout() {
    accountOpen.value = false
    const result = await confirm({
        title: 'Se déconnecter ?',
        text: 'Vous allez quitter l’espace administrateur.',
        confirmText: 'Déconnexion',
        icon: 'question',
    })
    if (!result.isConfirmed) return
    await navigateTo('/')
}

onMounted(() => {
    const platform = navigator.userAgent
    shortcutLabel.value = /Mac|iPhone|iPad/.test(platform) ? '⌘K' : 'Ctrl K'
    window.addEventListener('keydown', onGlobalKeydown)
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', onGlobalKeydown)
})
</script>

<template>
    <header class="z-30 flex h-16 shrink-0 items-center gap-2 border-b border-neutral-200 bg-surface px-3 sm:gap-3 sm:px-4 lg:px-6">
        <div class="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <button
                type="button"
                class="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl text-neutral-700 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 lg:hidden"
                :aria-expanded="sidebarOpen"
                aria-controls="app-sidebar"
                aria-label="Ouvrir le menu"
                @click="toggleSidebar"
            >
                <i class="fa-solid fa-bars" />
            </button>

            <div ref="searchRoot" class="relative min-w-0 flex-1 lg:max-w-md">
                <form @submit.prevent="onSearchSubmit">
                    <label class="flex h-10 items-center gap-2.5 rounded-full bg-neutral-100 px-4 transition-[box-shadow,background-color] focus-within:bg-surface focus-within:ring-2 focus-within:ring-primary/30">
                        <i class="fa-solid fa-magnifying-glass shrink-0 text-sm text-neutral-400" aria-hidden="true" />
                        <input
                            ref="searchRef"
                            v-model="query"
                            type="text"
                            placeholder="Rechercher une section"
                            autocomplete="off"
                            role="combobox"
                            aria-label="Rechercher une section"
                            aria-autocomplete="list"
                            :aria-expanded="showResults"
                            aria-controls="header-search-results"
                            class="h-10 min-w-0 flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
                            @focus="searchOpen = query.trim().length > 0"
                            @keydown="onSearchKeydown"
                        >
                        <kbd class="hidden shrink-0 rounded-md bg-neutral-200/80 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-500 sm:inline">
                            {{ shortcutLabel }}
                        </kbd>
                    </label>
                </form>

                <div
                    v-if="showResults"
                    id="header-search-results"
                    role="listbox"
                    class="absolute inset-x-0 top-[calc(100%+0.5rem)] z-40 overflow-hidden rounded-2xl bg-surface p-1.5 shadow-lg shadow-black/10 ring-1 ring-neutral-200"
                >
                    <p v-if="results.length === 0" class="px-3 py-3 text-sm text-neutral-500">
                        Aucune section ne correspond.
                    </p>
                    <button
                        v-for="(item, index) in results"
                        :key="item.to"
                        type="button"
                        role="option"
                        :aria-selected="index === activeIndex"
                        class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors focus-visible:outline-none"
                        :class="index === activeIndex ? 'bg-neutral-100' : 'hover:bg-neutral-100'"
                        @mouseenter="activeIndex = index"
                        @click="openResult(item)"
                    >
                        <span class="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <i :class="item.icon" class="text-xs" aria-hidden="true" />
                        </span>
                        <span class="min-w-0">
                            <span class="block truncate text-sm font-semibold text-neutral-950">{{ item.label }}</span>
                            <span class="block truncate text-xs text-neutral-500">{{ item.description }}</span>
                        </span>
                    </button>
                </div>
            </div>
        </div>

        <div class="flex shrink-0 items-center gap-1 sm:gap-2">
            <button
                type="button"
                class="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                :aria-label="isDark ? 'Activer le mode clair' : 'Activer le mode sombre'"
                @click="toggleColorMode"
            >
                <i :class="isDark ? 'fa-regular fa-sun' : 'fa-regular fa-moon'" aria-hidden="true" />
            </button>

            <UiDropdown v-model="accountOpen" align="end" label="Menu du compte">
                <template #trigger="{ open, toggle }">
                    <button
                        type="button"
                        class="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-neutral-100 py-1 pl-1 pr-2 transition-colors hover:bg-neutral-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:pr-3"
                        aria-haspopup="menu"
                        :aria-expanded="open"
                        aria-label="Menu du compte"
                        @click="toggle"
                    >
                        <span class="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                            {{ userInitials }}
                        </span>
                        <span class="hidden max-w-40 truncate text-sm font-medium text-neutral-700 md:block">{{ accountName }}</span>
                        <i
                            class="fa-solid fa-chevron-down hidden text-[10px] text-neutral-400 transition-transform sm:block"
                            :class="open && 'rotate-180'"
                            aria-hidden="true"
                        />
                    </button>
                </template>

                <div class="w-72">
                    <div class="flex items-center gap-3 px-3 py-3">
                        <span class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                            {{ userInitials }}
                        </span>
                        <div class="min-w-0">
                            <p class="truncate text-sm font-semibold text-neutral-950">{{ accountName }}</p>
                            <p class="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-500">
                                <span class="size-1.5 rounded-full bg-tertiary" />
                                En ligne
                            </p>
                        </div>
                    </div>

                    <div class="mx-2 my-1 h-px bg-neutral-200" />

                    <NuxtLink
                        to="/profil"
                        role="menuitem"
                        tabindex="-1"
                        class="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        @click.prevent="openAccountLink('/profil')"
                    >
                        <i class="fa-regular fa-user w-4 text-center text-neutral-400" aria-hidden="true" />
                        Voir le profil
                    </NuxtLink>
                    <NuxtLink
                        to="/dashboard"
                        role="menuitem"
                        tabindex="-1"
                        class="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        @click.prevent="openAccountLink('/dashboard')"
                    >
                        <i class="fa-solid fa-gauge-high w-4 text-center text-neutral-400" aria-hidden="true" />
                        Tableau de bord
                    </NuxtLink>

                    <div class="mx-2 my-1 h-px bg-neutral-200" />

                    <div class="px-3 py-2">
                        <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                            Apparence
                        </p>
                        <div class="mt-2 grid grid-cols-3 gap-1">
                            <button
                                v-for="option in appearance"
                                :key="option.value"
                                type="button"
                                role="menuitem"
                                tabindex="-1"
                                class="flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                                :class="colorMode.preference === option.value
                                    ? 'bg-primary text-white'
                                    : 'text-neutral-600 hover:bg-neutral-100'"
                                :aria-pressed="colorMode.preference === option.value"
                                @click="setPreference(option.value)"
                            >
                                <i :class="option.icon" aria-hidden="true" />
                                {{ option.label }}
                            </button>
                        </div>
                    </div>

                    <div class="mx-2 my-1 h-px bg-neutral-200" />

                    <button
                        type="button"
                        role="menuitem"
                        tabindex="-1"
                        class="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        @click="logout"
                    >
                        <i class="fa-solid fa-arrow-right-from-bracket w-4 text-center" aria-hidden="true" />
                        Déconnexion
                    </button>
                </div>
            </UiDropdown>
        </div>
    </header>
</template>
