<template>
    <div class="min-h-screen bg-canvas font-sans antialiased text-neutral-900">
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
        <ClientOnly>
            <UiAlertHost />
            <UiToastHost />
        </ClientOnly>
    </div>
</template>
