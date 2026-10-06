import { gql } from 'graphql-tag'
import { VEHICLE_TYPE_FIELDS } from './fragments'

export const VEHICLE_TYPES = gql`
    query VehicleTypes($filter: VehicleTypeFilterInput) {
        vehicleTypes(filter: $filter) {
            ...VehicleTypeFields
        }
    }
    ${VEHICLE_TYPE_FIELDS}
`

export const VEHICLE_TYPE = gql`
    query VehicleType($id: ID!) {
        vehicleType(id: $id) {
            ...VehicleTypeFields
        }
    }
    ${VEHICLE_TYPE_FIELDS}
`
