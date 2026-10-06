import { gql } from 'graphql-tag'
import { VEHICLE_FIELDS } from './fragments'

export const CREATE_VEHICLE = gql`
    mutation CreateVehicle($input: CreateVehicleInput!) {
        createVehicle(input: $input) {
            ...VehicleFields
        }
    }
    ${VEHICLE_FIELDS}
`

export const UPDATE_VEHICLE = gql`
    mutation UpdateVehicle($id: ID!, $input: UpdateVehicleInput!) {
        updateVehicle(id: $id, input: $input) {
            ...VehicleFields
        }
    }
    ${VEHICLE_FIELDS}
`

export const DELETE_VEHICLE = gql`
    mutation DeleteVehicle($id: ID!) {
        deleteVehicle(id: $id)
    }
`
