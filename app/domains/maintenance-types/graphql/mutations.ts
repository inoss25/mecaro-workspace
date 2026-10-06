import { gql } from 'graphql-tag'
import { MAINTENANCE_TYPE_FIELDS } from './fragments'

export const CREATE_MAINTENANCE_TYPE = gql`
    mutation CreateMaintenanceType($input: MaintenanceTypeCreateInput!) {
        createMaintenanceType(input: $input) {
            ...MaintenanceTypeFields
        }
    }
    ${MAINTENANCE_TYPE_FIELDS}
`

export const UPDATE_MAINTENANCE_TYPE = gql`
    mutation UpdateMaintenanceType($id: ID!, $input: MaintenanceTypeUpdateInput!) {
        updateMaintenanceType(id: $id, input: $input) {
            ...MaintenanceTypeFields
        }
    }
    ${MAINTENANCE_TYPE_FIELDS}
`

export const DELETE_MAINTENANCE_TYPE = gql`
    mutation DeleteMaintenanceType($id: ID!) {
        deleteMaintenanceType(id: $id)
    }
`
