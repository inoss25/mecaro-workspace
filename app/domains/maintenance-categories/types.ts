export type SortOrder = 'ASC' | 'DESC'

export type MaintenanceCategoryOrderByColumn = 'NAME' | 'CREATED_AT' | 'UPDATED_AT'

export interface MaintenanceCategory {
    id: string
    name: string
    icon: string | null
    description: string | null
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

export interface MaintenanceCategoryPaginator {
    data: MaintenanceCategory[]
    paginatorInfo: PaginatorInfo
}

export interface MaintenanceCategoryCreateInput {
    name: string
    icon?: string | null
    description?: string | null
    is_active?: boolean | null
}

export interface MaintenanceCategoryUpdateInput {
    name?: string | null
    icon?: string | null
    description?: string | null
    is_active?: boolean | null
}

export interface MaintenanceCategoryFilterInput {
    search?: string | null
    is_active?: boolean | null
}

export interface MaintenanceCategoryOrderInput {
    column: MaintenanceCategoryOrderByColumn
    order: SortOrder
}

export interface MaintenanceCategoryPaginatorInput {
    order_by?: MaintenanceCategoryOrderInput | null
    filter?: MaintenanceCategoryFilterInput | null
    first?: number | null
    page?: number | null
}

export interface MaintenanceCategoryPaginateQueryVariables {
    input?: MaintenanceCategoryPaginatorInput | null
}

export interface MaintenanceCategoryPaginateQueryResult {
    maintenanceCategoryPaginate: MaintenanceCategoryPaginator
}

export interface MaintenanceCategoriesQueryVariables {
    filter?: MaintenanceCategoryFilterInput | null
    order_by?: MaintenanceCategoryOrderInput | null
}

export interface MaintenanceCategoriesQueryResult {
    maintenanceCategories: MaintenanceCategory[]
}

export interface MaintenanceCategoryQueryVariables {
    id: string
}

export interface MaintenanceCategoryQueryResult {
    maintenanceCategory: MaintenanceCategory | null
}

export interface CreateMaintenanceCategoryMutationVariables {
    input: MaintenanceCategoryCreateInput
}

export interface CreateMaintenanceCategoryMutationResult {
    createMaintenanceCategory: MaintenanceCategory
}

export interface UpdateMaintenanceCategoryMutationVariables {
    id: string
    input: MaintenanceCategoryUpdateInput
}

export interface UpdateMaintenanceCategoryMutationResult {
    updateMaintenanceCategory: MaintenanceCategory
}

export interface DeleteMaintenanceCategoryMutationVariables {
    id: string
}

export interface DeleteMaintenanceCategoryMutationResult {
    deleteMaintenanceCategory: boolean
}
