import { gql } from 'graphql-tag'

export const VEHICLE_TYPE_FIELDS = gql`
    fragment VehicleTypeFields on VehicleType {
        id
        name
        key
        icon
        is_active
        created_at
        updated_at
    }
`
