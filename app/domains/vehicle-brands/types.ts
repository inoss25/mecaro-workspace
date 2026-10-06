export type SortOrder = 'ASC' | 'DESC'

export type VehicleBrandOrderByColumn = 'NAME' | 'CREATED_AT' | 'UPDATED_AT'

export interface VehicleBrand {
    id: string
    name: string
    key: string
    logo_path: string | null
    logo_url: string | null
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

export interface VehicleBrandPaginator {
    data: VehicleBrand[]
    paginatorInfo: PaginatorInfo
}

export interface VehicleBrandCreateInput {
    name: string
    key: string
    logo?: File | null
    is_active?: boolean | null
}

export interface VehicleBrandUpdateInput {
    name?: string | null
    key?: string | null
    logo?: File | null
    is_active?: boolean | null
}

export interface VehicleBrandFilterInput {
    search?: string | null
    is_active?: boolean | null
    key?: string | null
}

export interface VehicleBrandOrderInput {
    column: VehicleBrandOrderByColumn
    order: SortOrder
}

export interface VehicleBrandPaginatorInput {
    order_by?: VehicleBrandOrderInput | null
    filter?: VehicleBrandFilterInput | null
    first?: number | null
    page?: number | null
}

export interface VehicleBrandPaginateQueryVariables {
    input?: VehicleBrandPaginatorInput | null
}

export interface VehicleBrandPaginateQueryResult {
    vehicleBrandPaginate: VehicleBrandPaginator
}

export interface VehicleBrandsQueryVariables {
    filter?: VehicleBrandFilterInput | null
    order_by?: VehicleBrandOrderInput | null
}

export interface VehicleBrandsQueryResult {
    vehicleBrands: VehicleBrand[]
}

export interface VehicleBrandQueryVariables {
    id: string
}

export interface VehicleBrandQueryResult {
    vehicleBrand: VehicleBrand | null
}

export interface CreateVehicleBrandMutationVariables {
    input: VehicleBrandCreateInput
}

export interface CreateVehicleBrandMutationResult {
    createVehicleBrand: VehicleBrand
}

export interface UpdateVehicleBrandMutationVariables {
    id: string
    input: VehicleBrandUpdateInput
}

export interface UpdateVehicleBrandMutationResult {
    updateVehicleBrand: VehicleBrand
}

export interface DeleteVehicleBrandMutationVariables {
    id: string
}

export interface DeleteVehicleBrandMutationResult {
    deleteVehicleBrand: boolean
}
