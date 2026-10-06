import { gql } from 'graphql-tag'

export const MAINTENANCE_CATEGORY_FIELDS = gql`
    fragment MaintenanceCategoryFields on MaintenanceCategory {
        id
        name
        icon
        description
        is_active
        created_at
        updated_at
    }
`
