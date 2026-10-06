import type { MaintenanceVehicleRef } from '../maintenance-records/types'

export type SortOrder = 'ASC' | 'DESC'

export type MaintenanceOilOrderByColumn = 'CREATED_AT' | 'UPDATED_AT'

export interface MaintenanceOilRecordRef {
    id: string
    maintenance_date: string
    vehicle: MaintenanceVehicleRef
    maintenance_type: { id: string, name: string }
}

export interface MaintenanceOil {
    id: string
    maintenance_record: MaintenanceOilRecordRef
    brand: string | null
    product_name: string | null
    viscosity: string | null
    quantity: number | null
    unit: string
    unit_price: number | null
    total_price: number | null
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

export interface MaintenanceOilPaginator {
    data: MaintenanceOil[]
    paginatorInfo: PaginatorInfo
}

export interface MaintenanceOilCreateInput {
    maintenance_record_id: string
    brand?: string | null
    product_name?: string | null
    viscosity?: string | null
    quantity?: number | null
    unit?: string | null
    unit_price?: number | null
    total_price?: number | null
    notes?: string | null
}

export interface MaintenanceOilUpdateInput {
    maintenance_record_id?: string | null
    brand?: string | null
    product_name?: string | null
    viscosity?: string | null
    quantity?: number | null
    unit?: string | null
    unit_price?: number | null
    total_price?: number | null
    notes?: string | null
}

export interface MaintenanceOilFilterInput {
    search?: string | null
    maintenance_record_id?: string | null
}

export interface MaintenanceOilOrderInput {
    column: MaintenanceOilOrderByColumn
    order: SortOrder
}

export interface MaintenanceOilPaginatorInput {
    order_by?: MaintenanceOilOrderInput | null
    filter?: MaintenanceOilFilterInput | null
    first?: number | null
    page?: number | null
}

export interface MaintenanceOilPaginateQueryVariables {
    input?: MaintenanceOilPaginatorInput | null
}

export interface MaintenanceOilPaginateQueryResult {
    maintenanceOilPaginate: MaintenanceOilPaginator
}

export interface MaintenanceOilQueryVariables {
    id: string
}

export interface MaintenanceOilQueryResult {
    maintenanceOil: MaintenanceOil | null
}

export interface CreateMaintenanceOilMutationVariables {
    input: MaintenanceOilCreateInput
}

export interface CreateMaintenanceOilMutationResult {
    createMaintenanceOil: MaintenanceOil
}

export interface UpdateMaintenanceOilMutationVariables {
    id: string
    input: MaintenanceOilUpdateInput
}

export interface UpdateMaintenanceOilMutationResult {
    updateMaintenanceOil: MaintenanceOil
}

export interface DeleteMaintenanceOilMutationVariables {
    id: string
}

export interface DeleteMaintenanceOilMutationResult {
    deleteMaintenanceOil: boolean
}
