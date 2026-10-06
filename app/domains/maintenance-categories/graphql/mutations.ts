import { gql } from 'graphql-tag'
import { MAINTENANCE_CATEGORY_FIELDS } from './fragments'

export const CREATE_MAINTENANCE_CATEGORY = gql`
    mutation CreateMaintenanceCategory($input: MaintenanceCategoryCreateInput!) {
        createMaintenanceCategory(input: $input) {
            ...MaintenanceCategoryFields
        }
    }
    ${MAINTENANCE_CATEGORY_FIELDS}
`

export const UPDATE_MAINTENANCE_CATEGORY = gql`
    mutation UpdateMaintenanceCategory($id: ID!, $input: MaintenanceCategoryUpdateInput!) {
        updateMaintenanceCategory(id: $id, input: $input) {
            ...MaintenanceCategoryFields
        }
    }
    ${MAINTENANCE_CATEGORY_FIELDS}
`

export const DELETE_MAINTENANCE_CATEGORY = gql`
    mutation DeleteMaintenanceCategory($id: ID!) {
        deleteMaintenanceCategory(id: $id)
    }
`
