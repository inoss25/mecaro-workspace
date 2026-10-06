export type SortOrder = 'ASC' | 'DESC'

export type MaintenanceRecordOrderByColumn = 'MAINTENANCE_DATE' | 'MILEAGE' | 'COST' | 'CREATED_AT' | 'UPDATED_AT'

export interface MaintenanceVehicleRef {
    id: string
    name: string | null
    registration_number: string | null
    custom_brand_name: string | null
    custom_model_name: string | null
    vehicleBrand: { name: string } | null
    vehicleModel: { name: string } | null
}

export interface MaintenanceRecordTypeRef {
    id: string
    name: string
}

export interface MaintenanceRecord {
    id: string
    vehicle: MaintenanceVehicleRef
    maintenance_type: MaintenanceRecordTypeRef
    maintenance_date: string
    mileage: number
    cost: number
    description: string | null
    notes: string | null
    oils: { id: string }[]
    parts: { id: string }[]
    created_at: string
    updated_at: string
    deleted_at: string | null
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

export interface MaintenanceRecordPaginator {
    data: MaintenanceRecord[]
    paginatorInfo: PaginatorInfo
}

export interface MaintenanceRecordCreateInput {
    vehicle_id: string
    maintenance_type_id: string
    maintenance_date: string
    mileage: number
    cost?: number | null
    description?: string | null
    notes?: string | null
}

export interface MaintenanceRecordUpdateInput {
    vehicle_id?: string | null
    maintenance_type_id?: string | null
    maintenance_date?: string | null
    mileage?: number | null
    cost?: number | null
    description?: string | null
    notes?: string | null
}

export interface MaintenanceRecordFilterInput {
    search?: string | null
    vehicle_id?: string | null
    maintenance_type_id?: string | null
    maintenance_date_from?: string | null
    maintenance_date_to?: string | null
}

export interface MaintenanceRecordOrderInput {
    column: MaintenanceRecordOrderByColumn
    order: SortOrder
}

export interface MaintenanceRecordPaginatorInput {
    order_by?: MaintenanceRecordOrderInput | null
    filter?: MaintenanceRecordFilterInput | null
    first?: number | null
    page?: number | null
}

export interface MaintenanceRecordPaginateQueryVariables {
    input?: MaintenanceRecordPaginatorInput | null
}

export interface MaintenanceRecordPaginateQueryResult {
    maintenanceRecordPaginate: MaintenanceRecordPaginator
}

export interface MaintenanceRecordsQueryVariables {
    filter?: MaintenanceRecordFilterInput | null
    order_by?: MaintenanceRecordOrderInput | null
}

export interface MaintenanceRecordsQueryResult {
    maintenanceRecords: MaintenanceRecord[]
}

export interface MaintenanceRecordQueryVariables {
    id: string
}

export interface MaintenanceRecordQueryResult {
    maintenanceRecord: MaintenanceRecord | null
}

export interface CreateMaintenanceRecordMutationVariables {
    input: MaintenanceRecordCreateInput
}

export interface CreateMaintenanceRecordMutationResult {
    createMaintenanceRecord: MaintenanceRecord
}

export interface UpdateMaintenanceRecordMutationVariables {
    id: string
    input: MaintenanceRecordUpdateInput
}

export interface UpdateMaintenanceRecordMutationResult {
    updateMaintenanceRecord: MaintenanceRecord
}

export interface DeleteMaintenanceRecordMutationVariables {
    id: string
}

export interface DeleteMaintenanceRecordMutationResult {
    deleteMaintenanceRecord: boolean
}
