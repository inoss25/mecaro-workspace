export interface VehicleType {
    id: string
    name: string
    key: string
    icon: string | null
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface VehicleTypeCreateInput {
    name: string
    key: string
    icon?: string | null
    is_active?: boolean | null
}

export interface VehicleTypeUpdateInput {
    name?: string | null
    key?: string | null
    icon?: string | null
    is_active?: boolean | null
}

export interface VehicleTypeFilterInput {
    search?: string | null
    is_active?: boolean | null
}

export interface VehicleTypesQueryVariables {
    filter?: VehicleTypeFilterInput | null
}

export interface VehicleTypesQueryResult {
    vehicleTypes: VehicleType[]
}

export interface VehicleTypeQueryVariables {
    id: string
}

export interface VehicleTypeQueryResult {
    vehicleType: VehicleType | null
}

export interface CreateVehicleTypeMutationVariables {
    input: VehicleTypeCreateInput
}

export interface CreateVehicleTypeMutationResult {
    createVehicleType: VehicleType
}

export interface UpdateVehicleTypeMutationVariables {
    id: string
    input: VehicleTypeUpdateInput
}

export interface UpdateVehicleTypeMutationResult {
    updateVehicleType: VehicleType
}

export interface DeleteVehicleTypeMutationVariables {
    id: string
}

export interface DeleteVehicleTypeMutationResult {
    deleteVehicleType: VehicleType
}
