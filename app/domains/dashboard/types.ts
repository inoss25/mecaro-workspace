export interface DashboardStats {
    total_vehicles: number
    total_fuel_records: number
    total_users: number
    total_maintenance_records: number
}

export interface DashboardUserChartPoint {
    month: string
    users: number
}

export interface DashboardMaintenanceChartPoint {
    month: string
    records: number
}

export interface DashboardNewestUser {
    id: string
    name: string
    email: string | null
    created_at: string
}

export interface DashboardNewestMaintenanceRecord {
    id: string
    vehicle_id: string
    description: string | null
    created_at: string
}

export interface DashboardQueryVariables {
    limit: number
}

export interface DashboardQueryResult {
    dashboardStats: DashboardStats
    dashboardUserChartByMonth: DashboardUserChartPoint[]
    dashboardMaintenanceChartByMonth: DashboardMaintenanceChartPoint[]
    dashboardNewestUsers: DashboardNewestUser[]
    dashboardNewestMaintenanceRecords: DashboardNewestMaintenanceRecord[]
}
