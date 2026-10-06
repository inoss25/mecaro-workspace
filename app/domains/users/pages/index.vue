<script setup lang="ts">
import UserCreateModal from '../components/UserCreateModal.vue'
import UserEditModal from '../components/UserEditModal.vue'
import UserList from '../components/UserList.vue'
import UserPasswordModal from '../components/UserPasswordModal.vue'
import type { User } from '../types'

const appConfig = useAppConfig()

useHead({
    title: `Utilisateurs — ${appConfig.title}`,
})

const createOpen = ref(false)
const editOpen = ref(false)
const passwordOpen = ref(false)
const selected = ref<User | null>(null)

function onEdit(user: User) {
    selected.value = user
    editOpen.value = true
}

function onPassword(user: User) {
    selected.value = user
    passwordOpen.value = true
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <LayoutsSectionPage
            title="Utilisateurs"
            description="Gérez les comptes, leur statut et leurs accès."
        >
            <template #actions>
                <UiButton size="sm" @click="createOpen = true">
                    <template #leading>
                        <i class="fa-solid fa-plus text-xs" />
                    </template>
                    Nouvel utilisateur
                </UiButton>
            </template>
        </LayoutsSectionPage>

        <UserList @edit="onEdit" @password="onPassword" />

        <UserCreateModal v-model="createOpen" />
        <UserEditModal v-model="editOpen" :user="selected" />
        <UserPasswordModal v-model="passwordOpen" :user="selected" />
    </div>
</template>
