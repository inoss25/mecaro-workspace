export type FuelType = 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID'

export type SortOrder = 'ASC' | 'DESC'

export type FuelRecordOrderByColumn = 'FUEL_DATE' | 'MILEAGE' | 'TOTAL_PRICE' | 'CREATED_AT' | 'UPDATED_AT'

export interface FuelRecordVehicleRef {
    id: string
    name: string | null
    registration_number: string | null
    custom_brand_name: string | null
    custom_model_name: string | null
    vehicleBrand: { name: string } | null
    vehicleModel: { name: string } | null
}

export interface FuelRecord {
    id: string
    vehicle: FuelRecordVehicleRef
    fuel_type: FuelType
    mileage: number
    quantity: number | null
    unit_price: number | null
    total_price: number
    fuel_date: string
    payment_method: string | null
    full_tank: boolean
    notes: string | null
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

export interface FuelRecordPaginator {
    data: FuelRecord[]
    paginatorInfo: PaginatorInfo
}

export interface FuelRecordCreateInput {
    vehicle_id: string
    fuel_type: FuelType
    mileage: number
    quantity?: number | null
    unit_price?: number | null
    total_price: number
    fuel_date: string
    payment_method?: string | null
    full_tank?: boolean | null
    notes?: string | null
}

export interface FuelRecordUpdateInput {
    vehicle_id?: string | null
    fuel_type?: FuelType | null
    mileage?: number | null
    quantity?: number | null
    unit_price?: number | null
    total_price?: number | null
    fuel_date?: string | null
    payment_method?: string | null
    full_tank?: boolean | null
    notes?: string | null
}

export interface FuelRecordFilterInput {
    search?: string | null
    vehicle_id?: string | null
    fuel_type?: FuelType | null
    payment_method?: string | null
    full_tank?: boolean | null
    fuel_date_from?: string | null
    fuel_date_to?: string | null
}

export interface FuelRecordOrderInput {
    column: FuelRecordOrderByColumn
    order: SortOrder
}

export interface FuelRecordPaginatorInput {
    order_by?: FuelRecordOrderInput | null
    filter?: FuelRecordFilterInput | null
    first?: number | null
    page?: number | null
}

export interface FuelRecordPaginateQueryVariables {
    input?: FuelRecordPaginatorInput | null
}

export interface FuelRecordPaginateQueryResult {
    fuelRecordPaginate: FuelRecordPaginator
}

export interface FuelRecordsQueryVariables {
    filter?: FuelRecordFilterInput | null
    order_by?: FuelRecordOrderInput | null
}

export interface FuelRecordsQueryResult {
    fuelRecords: FuelRecord[]
}

export interface FuelRecordQueryVariables {
    id: string
}

export interface FuelRecordQueryResult {
    fuelRecord: FuelRecord | null
}

export interface CreateFuelRecordMutationVariables {
    input: FuelRecordCreateInput
}

export interface CreateFuelRecordMutationResult {
    createFuelRecord: FuelRecord
}

export interface UpdateFuelRecordMutationVariables {
    id: string
    input: FuelRecordUpdateInput
}

export interface UpdateFuelRecordMutationResult {
    updateFuelRecord: FuelRecord
}

export interface DeleteFuelRecordMutationVariables {
    id: string
}

export interface DeleteFuelRecordMutationResult {
    deleteFuelRecord: boolean
}
