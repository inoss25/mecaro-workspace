<script setup lang="ts">
const route = useRoute()
const { sidebarOpen, closeSidebar } = useAppShell()

watch(() => route.fullPath, () => {
    closeSidebar()
})

function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') closeSidebar()
}

function syncScrollLock(open: boolean) {
    if (!import.meta.client) return
    const lock = open && window.matchMedia('(max-width: 1023px)').matches
    document.body.classList.toggle('overflow-hidden', lock)
}

watch(sidebarOpen, syncScrollLock)

onMounted(() => {
    window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeydown)
    document.body.classList.remove('overflow-hidden')
})
</script>

<template>
    <div class="fixed inset-0 flex bg-canvas">
        <LayoutsSidebar />
        <div class="flex min-w-0 flex-1 flex-col">
            <LayoutsHeader />
            <main class="min-h-0 flex-1 overflow-y-auto px-4 py-4 lg:px-6 lg:py-6">
                <slot />
            </main>
        </div>
    </div>
</template>
