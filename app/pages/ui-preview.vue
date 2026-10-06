<script setup lang="ts">
definePageMeta({ layout: 'default' })

const note = ref('Contrôle visuel des composants.')
const role = ref('ACTIVE')
const status = ref('ACTIVE')
const birthDate = ref('1994-06-12')
const photo = ref<File | null>(null)
const menuChoice = ref('')

const roles = [
    { value: 'ACTIVE', label: 'Actif' },
    { value: 'INACTIVE', label: 'Inactif' },
    { value: 'BLOCKED', label: 'Bloqué' },
]

const today = new Date()
const maxDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

function statusClass(value: string) {
    if (value === 'ACTIVE') return 'bg-primary/10 text-primary'
    if (value === 'BLOCKED') return 'bg-red-50 text-red-700'
    return 'bg-neutral-100 text-neutral-600'
}
</script>

<template>
    <div class="mx-auto flex max-w-3xl flex-col gap-6 pb-16">
        <UiTextarea v-model="note" label="Note" placeholder="Ajouter une note" hint="Visible uniquement ici." />

        <UiSelect
            v-model="role"
            label="Statut"
            icon="fa-regular fa-circle-check"
            :options="roles"
        />

        <div class="flex flex-wrap items-center gap-3">
            <UiSelect
                v-model="role"
                :options="roles"
                prefix="Filtre"
                size="sm"
                :block="false"
            />
            <UiSelect
                v-model="status"
                variant="inline"
                label="Statut de la ligne"
                :options="roles"
                :control-class="statusClass(status)"
            />
            <UiAvatar name="Awa Diallo" size="sm" />
            <UiAvatar src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect fill='%23166534' width='64' height='64'/%3E%3C/svg%3E" alt="Portrait" size="md" />
            <UiAvatar shape="rounded" size="lg" />
            <UiDropdown
                :items="[
                    { label: 'Modifier', icon: 'fa-regular fa-pen' },
                    { label: 'Supprimer', icon: 'fa-regular fa-trash-can', danger: true },
                ]"
                @select="menuChoice = $event.label"
            />
            <span class="text-sm text-neutral-500">{{ menuChoice }}</span>
        </div>

        <UiDatePicker
            v-model="birthDate"
            label="Date de naissance"
            :max="maxDate"
            autocomplete="bday"
        />

        <UiImageUpload
            v-model="photo"
            label="Photo"
            hint="JPG ou PNG, aperçu local."
            shape="rounded"
        />
    </div>
</template>
