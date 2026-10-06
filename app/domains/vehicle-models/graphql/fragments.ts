import { gql } from 'graphql-tag'

export const VEHICLE_MODEL_FIELDS = gql`
    fragment VehicleModelFields on VehicleModel {
        id
        name
        key
        is_active
        created_at
        updated_at
        brand {
            id
            name
        }
    }
`
