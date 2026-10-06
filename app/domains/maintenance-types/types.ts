export type SortOrder = 'ASC' | 'DESC'

export type MaintenanceTypeOrderByColumn = 'NAME' | 'CREATED_AT' | 'UPDATED_AT'

export interface MaintenanceTypeCategoryRef {
    id: string
    name: string
}

export interface MaintenanceType {
    id: string
    category: MaintenanceTypeCategoryRef
    name: string
    description: string | null
    icon: string | null
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

export interface MaintenanceTypePaginator {
    data: MaintenanceType[]
    paginatorInfo: PaginatorInfo
}

export interface MaintenanceTypeCreateInput {
    maintenance_category_id: string
    name: string
    description?: string | null
    icon?: string | null
    is_active?: boolean | null
}

export interface MaintenanceTypeUpdateInput {
    maintenance_category_id?: string | null
    name?: string | null
    description?: string | null
    icon?: string | null
    is_active?: boolean | null
}

export interface MaintenanceTypeFilterInput {
    search?: string | null
    maintenance_category_id?: string | null
    is_active?: boolean | null
}

export interface MaintenanceTypeOrderInput {
    column: MaintenanceTypeOrderByColumn
    order: SortOrder
}

export interface MaintenanceTypePaginatorInput {
    order_by?: MaintenanceTypeOrderInput | null
    filter?: MaintenanceTypeFilterInput | null
    first?: number | null
    page?: number | null
}

export interface MaintenanceTypePaginateQueryVariables {
    input?: MaintenanceTypePaginatorInput | null
}

export interface MaintenanceTypePaginateQueryResult {
    maintenanceTypePaginate: MaintenanceTypePaginator
}

export interface MaintenanceTypesQueryVariables {
    filter?: MaintenanceTypeFilterInput | null
    order_by?: MaintenanceTypeOrderInput | null
}

export interface MaintenanceTypesQueryResult {
    maintenanceTypes: MaintenanceType[]
}

export interface MaintenanceTypeQueryVariables {
    id: string
}

export interface MaintenanceTypeQueryResult {
    maintenanceType: MaintenanceType | null
}

export interface CreateMaintenanceTypeMutationVariables {
    input: MaintenanceTypeCreateInput
}

export interface CreateMaintenanceTypeMutationResult {
    createMaintenanceType: MaintenanceType
}

export interface UpdateMaintenanceTypeMutationVariables {
    id: string
    input: MaintenanceTypeUpdateInput
}

export interface UpdateMaintenanceTypeMutationResult {
    updateMaintenanceType: MaintenanceType
}

export interface DeleteMaintenanceTypeMutationVariables {
    id: string
}

export interface DeleteMaintenanceTypeMutationResult {
    deleteMaintenanceType: boolean
}
