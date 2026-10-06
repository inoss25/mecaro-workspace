<script setup lang="ts">
import type { AlertDismissReason } from '~/composables/useAlert'

const { active, open, settle } = useAlertHost()

function onOpen(value: boolean) {
    open.value = value
}

function onConfirm(value?: string) {
    settle({
        isConfirmed: true,
        isDenied: false,
        isDismissed: false,
        value,
    })
}

function onCancel() {
    settle({
        isConfirmed: false,
        isDenied: false,
        isDismissed: true,
        dismiss: 'cancel',
    })
}

function onDeny(value?: string) {
    settle({
        isConfirmed: false,
        isDenied: true,
        isDismissed: false,
        value,
    })
}

function onDismiss(reason: AlertDismissReason) {
    settle({
        isConfirmed: false,
        isDenied: false,
        isDismissed: true,
        dismiss: reason,
    })
}
</script>

<template>
    <UiAlertDialog
        v-if="active"
        :key="active.id"
        :model-value="open"
        v-bind="active.options"
        @update:model-value="onOpen"
        @confirm="onConfirm"
        @cancel="onCancel"
        @deny="onDeny"
        @dismiss="onDismiss"
    />
</template>
