<script setup lang="ts">
import AdministratorCreateModal from '../components/AdministratorCreateModal.vue'
import AdministratorEditModal from '../components/AdministratorEditModal.vue'
import AdministratorList from '../components/AdministratorList.vue'
import AdministratorPasswordModal from '../components/AdministratorPasswordModal.vue'
import type { Administrator } from '../types'

const appConfig = useAppConfig()

useHead({
    title: `Administrateurs — ${appConfig.title}`,
})

const createOpen = ref(false)
const editOpen = ref(false)
const passwordOpen = ref(false)
const selected = ref<Administrator | null>(null)

function onEdit(administrator: Administrator) {
    selected.value = administrator
    editOpen.value = true
}

function onPassword(administrator: Administrator) {
    selected.value = administrator
    passwordOpen.value = true
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <LayoutsSectionPage
            title="Administrateurs"
            description="Gérez les comptes administrateurs, leur statut et leurs accès."
        >
            <template #actions>
                <UiButton size="sm" @click="createOpen = true">
                    <template #leading>
                        <i class="fa-solid fa-plus text-xs" />
                    </template>
                    Nouvel administrateur
                </UiButton>
            </template>
        </LayoutsSectionPage>

        <AdministratorList @edit="onEdit" @password="onPassword" />

        <AdministratorCreateModal v-model="createOpen" />
        <AdministratorEditModal v-model="editOpen" :administrator="selected" />
        <AdministratorPasswordModal v-model="passwordOpen" :administrator="selected" />
    </div>
</template>
