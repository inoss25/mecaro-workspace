import type { VehicleBrand } from '../../vehicle-brands/types'

export type SortOrder = 'ASC' | 'DESC'

export type VehicleModelOrderByColumn = 'NAME' | 'CREATED_AT' | 'UPDATED_AT'

export interface VehicleModelBrandRef {
    id: string
    name: string
}

export interface VehicleModel {
    id: string
    name: string
    key: string
    is_active: boolean
    brand: VehicleModelBrandRef
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

export interface VehicleModelPaginator {
    data: VehicleModel[]
    paginatorInfo: PaginatorInfo
}

export interface VehicleModelCreateInput {
    vehicle_brand_id: string
    name: string
    key: string
    is_active?: boolean | null
}

export interface VehicleModelUpdateInput {
    vehicle_brand_id?: string | null
    name?: string | null
    key?: string | null
    is_active?: boolean | null
}

export interface VehicleModelFilterInput {
    search?: string | null
    vehicle_brand_id?: string | null
    key?: string | null
    is_active?: boolean | null
}

export interface VehicleModelOrderInput {
    column: VehicleModelOrderByColumn
    order: SortOrder
}

export interface VehicleModelPaginatorInput {
    order_by?: VehicleModelOrderInput | null
    filter?: VehicleModelFilterInput | null
    first?: number | null
    page?: number | null
}

export interface VehicleModelPaginateQueryVariables {
    input?: VehicleModelPaginatorInput | null
}

export interface VehicleModelPaginateQueryResult {
    vehicleModelPaginate: VehicleModelPaginator
}

export interface VehicleModelsQueryVariables {
    filter?: VehicleModelFilterInput | null
    order_by?: VehicleModelOrderInput | null
}

export interface VehicleModelsQueryResult {
    vehicleModels: VehicleModel[]
}

export interface VehicleModelQueryVariables {
    id: string
}

export interface VehicleModelQueryResult {
    vehicleModel: VehicleModel | null
}

export interface CreateVehicleModelMutationVariables {
    input: VehicleModelCreateInput
}

export interface CreateVehicleModelMutationResult {
    createVehicleModel: VehicleModel
}

export interface UpdateVehicleModelMutationVariables {
    id: string
    input: VehicleModelUpdateInput
}

export interface UpdateVehicleModelMutationResult {
    updateVehicleModel: VehicleModel
}

export interface DeleteVehicleModelMutationVariables {
    id: string
}

export interface DeleteVehicleModelMutationResult {
    deleteVehicleModel: boolean
}

export type { VehicleBrand }
