import { gql } from 'graphql-tag'

export const VEHICLE_BRAND_FIELDS = gql`
    fragment VehicleBrandFields on VehicleBrand {
        id
        name
        key
        logo_path
        logo_url
        is_active
        created_at
        updated_at
    }
`
