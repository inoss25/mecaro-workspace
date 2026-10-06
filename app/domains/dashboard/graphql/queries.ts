import { gql } from 'graphql-tag'

export const DASHBOARD = gql`
    query Dashboard($limit: Int) {
        dashboardStats {
            total_vehicles
            total_fuel_records
            total_users
            total_maintenance_records
        }
        dashboardUserChartByMonth {
            month
            users
        }
        dashboardMaintenanceChartByMonth {
            month
            records
        }
        dashboardNewestUsers(limit: $limit) {
            id
            name
            email
            created_at
        }
        dashboardNewestMaintenanceRecords(limit: $limit) {
            id
            vehicle_id
            description
            created_at
        }
    }
`
