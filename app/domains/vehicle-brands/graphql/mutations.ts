import { gql } from 'graphql-tag'
import { VEHICLE_BRAND_FIELDS } from './fragments'

export const CREATE_VEHICLE_BRAND = gql`
    mutation CreateVehicleBrand($input: VehicleBrandCreateInput!) {
        createVehicleBrand(input: $input) {
            ...VehicleBrandFields
        }
    }
    ${VEHICLE_BRAND_FIELDS}
`

export const UPDATE_VEHICLE_BRAND = gql`
    mutation UpdateVehicleBrand($id: ID!, $input: VehicleBrandUpdateInput!) {
        updateVehicleBrand(id: $id, input: $input) {
            ...VehicleBrandFields
        }
    }
    ${VEHICLE_BRAND_FIELDS}
`

export const DELETE_VEHICLE_BRAND = gql`
    mutation DeleteVehicleBrand($id: ID!) {
        deleteVehicleBrand(id: $id)
    }
`
