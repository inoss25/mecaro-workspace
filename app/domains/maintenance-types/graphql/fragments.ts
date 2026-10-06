import { gql } from 'graphql-tag'

export const MAINTENANCE_TYPE_FIELDS = gql`
    fragment MaintenanceTypeFields on MaintenanceType {
        id
        name
        description
        icon
        is_active
        created_at
        updated_at
        category {
            id
            name
        }
    }
`
