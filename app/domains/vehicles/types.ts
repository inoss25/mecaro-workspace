export type FuelType = 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID'

export type SortOrder = 'ASC' | 'DESC'

export type VehicleOrderByColumn = 'NAME' | 'CURRENT_MILEAGE' | 'CREATED_AT' | 'UPDATED_AT'

export interface VehicleUser {
    id: string
    name: string
    first_name: string
    last_name: string
    image_url: string | null
}

export interface VehicleTypeRef {
    id: string
    name: string
    key: string
    icon: string | null
}

export interface VehicleBrandRef {
    id: string
    name: string
    key: string
}

export interface VehicleModelRef {
    id: string
    name: string
    key: string
}

export interface Vehicle {
    id: string
    user: VehicleUser
    vehicleType: VehicleTypeRef
    vehicleBrand: VehicleBrandRef | null
    vehicleModel: VehicleModelRef | null
    custom_brand_name: string | null
    custom_model_name: string | null
    engine_capacity: number | null
    transmission: string | null
    name: string | null
    registration_number: string | null
    fuel_type: FuelType | null
    color: string | null
    purchase_date: string | null
    manufacture_year: string | null
    image_path: string | null
    initial_mileage: number | null
    current_mileage: number | null
    is_active: boolean
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

export interface VehiclePaginator {
    data: Vehicle[]
    paginatorInfo: PaginatorInfo
}

export interface VehicleCreateInput {
    user_id: string
    vehicle_type_id: string
    vehicle_brand_id?: string | null
    vehicle_model_id?: string | null
    custom_brand_name?: string | null
    custom_model_name?: string | null
    engine_capacity?: number | null
    transmission?: string | null
    name?: string | null
    registration_number?: string | null
    fuel_type?: FuelType | null
    color?: string | null
    purchase_date?: string | null
    manufacture_year?: string | null
    image?: File | null
    initial_mileage?: number | null
    current_mileage?: number | null
    is_active?: boolean | null
}

export interface VehicleUpdateInput {
    vehicle_type_id?: string | null
    vehicle_brand_id?: string | null
    vehicle_model_id?: string | null
    custom_brand_name?: string | null
    custom_model_name?: string | null
    engine_capacity?: number | null
    transmission?: string | null
    name?: string | null
    registration_number?: string | null
    fuel_type?: FuelType | null
    color?: string | null
    purchase_date?: string | null
    manufacture_year?: string | null
    image?: File | null
    initial_mileage?: number | null
    current_mileage?: number | null
    is_active?: boolean | null
}

export interface VehicleFilterInput {
    search?: string | null
    user_id?: string | null
    vehicle_type_id?: string | null
    vehicle_brand_id?: string | null
    vehicle_model_id?: string | null
    fuel_type?: FuelType | null
    is_active?: boolean | null
}

export interface VehicleOrderInput {
    column: VehicleOrderByColumn
    order: SortOrder
}

export interface VehiclePaginatorInput {
    order_by?: VehicleOrderInput | null
    filter?: VehicleFilterInput | null
    first?: number | null
    page?: number | null
}

export interface VehiclePaginateQueryVariables {
    input?: VehiclePaginatorInput | null
}

export interface VehiclePaginateQueryResult {
    vehiclePaginate: VehiclePaginator
}

export interface VehiclesQueryVariables {
    filter?: VehicleFilterInput | null
    order_by?: VehicleOrderInput | null
}

export interface VehiclesQueryResult {
    vehicles: Vehicle[]
}

export interface VehicleQueryVariables {
    id: string
}

export interface VehicleQueryResult {
    vehicle: Vehicle
}

export interface CreateVehicleMutationVariables {
    input: VehicleCreateInput
}

export interface CreateVehicleMutationResult {
    createVehicle: Vehicle
}

export interface UpdateVehicleMutationVariables {
    id: string
    input: VehicleUpdateInput
}

export interface UpdateVehicleMutationResult {
    updateVehicle: Vehicle
}

export interface DeleteVehicleMutationVariables {
    id: string
}

export interface DeleteVehicleMutationResult {
    deleteVehicle: boolean
}
