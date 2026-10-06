import { defineStore } from 'pinia'
import { DASHBOARD } from '../graphql/queries'
import type {
    DashboardMaintenanceChartPoint,
    DashboardNewestMaintenanceRecord,
    DashboardNewestUser,
    DashboardQueryResult,
    DashboardQueryVariables,
    DashboardStats,
    DashboardUserChartPoint,
} from '../types'

const NEWEST_LIMIT = 8

export const useDashboardStore = defineStore('dashboard', () => {
    const stats = ref<DashboardStats | null>(null)
    const userChart = ref<DashboardUserChartPoint[]>([])
    const maintenanceChart = ref<DashboardMaintenanceChartPoint[]>([])
    const newestUsers = ref<DashboardNewestUser[]>([])
    const newestMaintenanceRecords = ref<DashboardNewestMaintenanceRecord[]>([])
    const loading = ref(false)
    const error = ref<unknown>(null)

    const client = useApolloClient()
    let requestId = 0

    async function fetchDashboard() {
        const current = ++requestId
        loading.value = true
        error.value = null

        try {
            const response = await client.query<DashboardQueryResult, DashboardQueryVariables>({
                query: DASHBOARD,
                variables: { limit: NEWEST_LIMIT },
                fetchPolicy: 'network-only',
            })
            if (current !== requestId) return

            stats.value = response.data?.dashboardStats ?? null
            userChart.value = response.data?.dashboardUserChartByMonth ?? []
            maintenanceChart.value = response.data?.dashboardMaintenanceChartByMonth ?? []
            newestUsers.value = response.data?.dashboardNewestUsers ?? []
            newestMaintenanceRecords.value = response.data?.dashboardNewestMaintenanceRecords ?? []
        }
        catch (cause) {
            if (current !== requestId) return
            error.value = cause
        }
        finally {
            if (current === requestId) loading.value = false
        }
    }

    return {
        stats,
        userChart,
        maintenanceChart,
        newestUsers,
        newestMaintenanceRecords,
        loading,
        error,
        fetchDashboard,
    }
})
