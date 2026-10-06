<script setup lang="ts">
const appConfig = useAppConfig()

useHead({
    title: `Garages — ${appConfig.title}`,
})
</script>

<template>
    <LayoutsSectionPage
        title="Garages"
        description="Consultez et organisez les garages."
    />
</template>
