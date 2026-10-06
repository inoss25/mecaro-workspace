<script setup lang="ts">
const appConfig = useAppConfig()

useHead({
    title: `Engins — ${appConfig.title}`,
})
</script>

<template>
    <LayoutsSectionPage
        title="Engins"
        description="Suivez les engins enregistrés dans l'atelier."
    />
</template>
