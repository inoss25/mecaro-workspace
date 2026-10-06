import type { MaintenanceVehicleRef } from '../maintenance-records/types'

export type SortOrder = 'ASC' | 'DESC'
export type MaintenanceSettingOrderByColumn = 'INTERVAL_KM' | 'CREATED_AT' | 'UPDATED_AT'

export interface MaintenanceSetting {
    id: string
    vehicle: MaintenanceVehicleRef
    maintenance_type: { id: string, name: string }
    interval_km: number | null
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface PaginatorInfo {
    count: number
    currentPage: number
    firstItem: number | null
    hasMorePages: boolean
    lastItem: number | null
    lastPage: number
    perPage: number
    total: number
}

export interface MaintenanceSettingPaginator {
    data: MaintenanceSetting[]
    paginatorInfo: PaginatorInfo
}

export interface MaintenanceSettingCreateInput {
    vehicle_id: string
    maintenance_type_id: string
    interval_km?: number | null
    is_active?: boolean | null
}

export interface MaintenanceSettingUpdateInput {
    vehicle_id?: string | null
    maintenance_type_id?: string | null
    interval_km?: number | null
    is_active?: boolean | null
}

export interface MaintenanceSettingFilterInput {
    vehicle_id?: string | null
    maintenance_type_id?: string | null
    is_active?: boolean | null
}

export interface MaintenanceSettingOrderInput {
    column: MaintenanceSettingOrderByColumn
    order: SortOrder
}

export interface MaintenanceSettingPaginatorInput {
    order_by?: MaintenanceSettingOrderInput | null
    filter?: MaintenanceSettingFilterInput | null
    first?: number | null
    page?: number | null
}

export interface MaintenanceSettingPaginateQueryVariables { input?: MaintenanceSettingPaginatorInput | null }
export interface MaintenanceSettingPaginateQueryResult { maintenanceSettingPaginate: MaintenanceSettingPaginator }
export interface MaintenanceSettingQueryVariables { id: string }
export interface MaintenanceSettingQueryResult { maintenanceSetting: MaintenanceSetting | null }
export interface CreateMaintenanceSettingMutationVariables { input: MaintenanceSettingCreateInput }
export interface CreateMaintenanceSettingMutationResult { createMaintenanceSetting: MaintenanceSetting }
export interface UpdateMaintenanceSettingMutationVariables { id: string, input: MaintenanceSettingUpdateInput }
export interface UpdateMaintenanceSettingMutationResult { updateMaintenanceSetting: MaintenanceSetting }
export interface DeleteMaintenanceSettingMutationVariables { id: string }
export interface DeleteMaintenanceSettingMutationResult { deleteMaintenanceSetting: boolean }
