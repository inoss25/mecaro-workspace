<script setup lang="ts">
import type { ToastPosition } from '~/composables/useToast'

const { items, dismiss } = useToastHost()

const placementClass: Record<ToastPosition, string> = {
    'top-right': 'top-0 right-0 p-4 sm:p-6',
    'top-left': 'top-0 left-0 p-4 sm:p-6',
    'top-center': 'top-0 left-1/2 -translate-x-1/2 p-4 sm:p-6',
    'bottom-right': 'right-0 bottom-0 p-4 sm:p-6',
    'bottom-left': 'bottom-0 left-0 p-4 sm:p-6',
    'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2 p-4 sm:p-6',
}

const edgeFor: Record<ToastPosition, 'right' | 'left' | 'down' | 'up'> = {
    'top-right': 'right',
    'bottom-right': 'right',
    'top-left': 'left',
    'bottom-left': 'left',
    'top-center': 'down',
    'bottom-center': 'up',
}

const groups = computed(() => {
    const positions = Object.keys(placementClass) as ToastPosition[]
    return positions
        .map(position => ({
            position,
            items: items.value.filter(item => item.position === position),
        }))
        .filter(group => group.items.length > 0)
})
</script>

<template>
    <Teleport to="body">
        <div
            v-for="group in groups"
            :key="group.position"
            class="pointer-events-none fixed z-[100] w-[min(24rem,calc(100vw-2rem))]"
            :class="placementClass[group.position]"
            role="region"
            aria-label="Notifications"
        >
            <TransitionGroup
                tag="div"
                name="ui-toast"
                class="pointer-events-none relative flex w-full flex-col gap-2"
                :class="group.position.startsWith('top') ? 'flex-col-reverse' : undefined"
            >
                <UiToast
                    v-for="item in group.items"
                    :key="item.id"
                    v-bind="item.props"
                    :edge="edgeFor[group.position]"
                    @dismiss="dismiss(item.id)"
                />
            </TransitionGroup>
        </div>
    </Teleport>
</template>
