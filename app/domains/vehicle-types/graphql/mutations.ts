import { gql } from 'graphql-tag'
import { VEHICLE_TYPE_FIELDS } from './fragments'

export const CREATE_VEHICLE_TYPE = gql`
    mutation CreateVehicleType($input: VehicleTypeCreateInput!) {
        createVehicleType(input: $input) {
            ...VehicleTypeFields
        }
    }
    ${VEHICLE_TYPE_FIELDS}
`

export const UPDATE_VEHICLE_TYPE = gql`
    mutation UpdateVehicleType($id: ID!, $input: VehicleTypeUpdateInput!) {
        updateVehicleType(id: $id, input: $input) {
            ...VehicleTypeFields
        }
    }
    ${VEHICLE_TYPE_FIELDS}
`

export const DELETE_VEHICLE_TYPE = gql`
    mutation DeleteVehicleType($id: ID!) {
        deleteVehicleType(id: $id) {
            ...VehicleTypeFields
        }
    }
    ${VEHICLE_TYPE_FIELDS}
`
