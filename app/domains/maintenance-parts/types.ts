import type { MaintenanceVehicleRef } from '../maintenance-records/types'

export type SortOrder = 'ASC' | 'DESC'
export type MaintenancePartOrderByColumn = 'NAME' | 'CREATED_AT' | 'UPDATED_AT'

export interface MaintenancePartRecordRef {
    id: string
    maintenance_date: string
    vehicle: MaintenanceVehicleRef
    maintenance_type: { id: string, name: string }
}

export interface MaintenancePart {
    id: string
    maintenanceRecord: MaintenancePartRecordRef
    name: string
    reference: string | null
    quantity: number
    unit_price: number | null
    total_price: number | null
    brand: string | null
    notes: string | null
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

export interface MaintenancePartPaginator {
    data: MaintenancePart[]
    paginatorInfo: PaginatorInfo
}

export interface MaintenancePartCreateInput {
    maintenance_record_id: string
    name: string
    reference?: string | null
    quantity?: number | null
    unit_price?: number | null
    total_price?: number | null
    brand?: string | null
    notes?: string | null
}

export interface MaintenancePartUpdateInput {
    maintenance_record_id?: string | null
    name?: string | null
    reference?: string | null
    quantity?: number | null
    unit_price?: number | null
    total_price?: number | null
    brand?: string | null
    notes?: string | null
}

export interface MaintenancePartFilterInput {
    search?: string | null
    maintenance_record_id?: string | null
}

export interface MaintenancePartOrderInput {
    column: MaintenancePartOrderByColumn
    order: SortOrder
}

export interface MaintenancePartPaginatorInput {
    order_by?: MaintenancePartOrderInput | null
    filter?: MaintenancePartFilterInput | null
    first?: number | null
    page?: number | null
}

export interface MaintenancePartPaginateQueryVariables {
    input?: MaintenancePartPaginatorInput | null
}

export interface MaintenancePartPaginateQueryResult {
    maintenancePartPaginate: MaintenancePartPaginator
}

export interface MaintenancePartQueryVariables { id: string }
export interface MaintenancePartQueryResult { maintenancePart: MaintenancePart | null }
export interface CreateMaintenancePartMutationVariables { input: MaintenancePartCreateInput }
export interface CreateMaintenancePartMutationResult { createMaintenancePart: MaintenancePart }
export interface UpdateMaintenancePartMutationVariables { id: string, input: MaintenancePartUpdateInput }
export interface UpdateMaintenancePartMutationResult { updateMaintenancePart: MaintenancePart }
export interface DeleteMaintenancePartMutationVariables { id: string }
export interface DeleteMaintenancePartMutationResult { deleteMaintenancePart: boolean }
