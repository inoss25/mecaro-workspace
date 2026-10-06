<script setup lang="ts">
import { LegendPosition } from 'nuxt-charts/enums'
import { chartMonthLabel, formatCount } from '../utils/display'

const props = withDefaults(defineProps<{
    title: string
    description: string
    seriesName: string
    color: string
    ariaLabel: string
    points: Array<{ month: string, value: number }>
    loading?: boolean
}>(), {
    loading: false,
})

const chartData = computed(() => props.points.map(point => ({
    month: point.month,
    value: point.value,
})))

const categories = computed(() => ({
    value: {
        name: props.seriesName,
        color: props.color,
    },
}))

const colorMode = useColorMode()

const axisConfig = computed(() => ({
    tickTextFontSize: '11px',
    tickTextColor: colorMode.value === 'dark' ? '#c5d4cb' : '#737373',
}))

function xFormatter(index: number) {
    const month = chartData.value[index]?.month
    return month ? chartMonthLabel(month) : ''
}

function yFormatter(tick: number) {
    if (!Number.isFinite(tick) || !Number.isInteger(tick)) return ''
    return formatCount(tick)
}

function tooltipTitle(row: { month: string }) {
    return chartMonthLabel(row.month, 'long')
}
</script>

<template>
    <section class="flex flex-col rounded-[28px] bg-surface p-5 shadow-sm sm:p-6">
        <div class="mb-4">
            <h3 class="text-lg font-semibold tracking-tight text-neutral-950">
                {{ title }}
            </h3>
            <p class="mt-1 text-sm text-neutral-500">
                {{ description }}
            </p>
        </div>

        <ClientOnly>
            <BarChart
                :data="chartData"
                :height="280"
                :categories="categories"
                :y-axis="['value']"
                x-axis="month"
                :x-num-ticks="6"
                :radius="4"
                :bar-padding="0.2"
                :group-padding="0"
                :y-grid-line="true"
                :x-formatter="xFormatter"
                :y-formatter="yFormatter"
                :tooltip-title-formatter="tooltipTitle"
                :legend-position="LegendPosition.TopRight"
                :hide-legend="false"
                :loading="loading"
                loading-label="Chargement"
                empty-label="Aucune donnée sur cette période"
                :aria-label="ariaLabel"
                :x-axis-config="axisConfig"
                :y-axis-config="axisConfig"
            />
            <template #fallback>
                <div class="h-[280px] animate-pulse rounded-2xl bg-neutral-100" />
            </template>
        </ClientOnly>
    </section>
</template>
