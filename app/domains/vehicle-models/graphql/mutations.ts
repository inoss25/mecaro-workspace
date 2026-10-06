import { gql } from 'graphql-tag'
import { VEHICLE_MODEL_FIELDS } from './fragments'

export const CREATE_VEHICLE_MODEL = gql`
    mutation CreateVehicleModel($input: VehicleModelCreateInput!) {
        createVehicleModel(input: $input) {
            ...VehicleModelFields
        }
    }
    ${VEHICLE_MODEL_FIELDS}
`

export const UPDATE_VEHICLE_MODEL = gql`
    mutation UpdateVehicleModel($id: ID!, $input: VehicleModelUpdateInput!) {
        updateVehicleModel(id: $id, input: $input) {
            ...VehicleModelFields
        }
    }
    ${VEHICLE_MODEL_FIELDS}
`

export const DELETE_VEHICLE_MODEL = gql`
    mutation DeleteVehicleModel($id: ID!) {
        deleteVehicleModel(id: $id)
    }
`
