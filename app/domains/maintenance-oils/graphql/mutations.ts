import { gql } from 'graphql-tag'
import { MAINTENANCE_OIL_FIELDS } from './fragments'

export const CREATE_MAINTENANCE_OIL = gql`
    mutation CreateMaintenanceOil($input: MaintenanceOilCreateInput!) {
        createMaintenanceOil(input: $input) { ...MaintenanceOilFields }
    }
    ${MAINTENANCE_OIL_FIELDS}
`

export const UPDATE_MAINTENANCE_OIL = gql`
    mutation UpdateMaintenanceOil($id: ID!, $input: MaintenanceOilUpdateInput!) {
        updateMaintenanceOil(id: $id, input: $input) { ...MaintenanceOilFields }
    }
    ${MAINTENANCE_OIL_FIELDS}
`

export const DELETE_MAINTENANCE_OIL = gql`
    mutation DeleteMaintenanceOil($id: ID!) {
        deleteMaintenanceOil(id: $id)
    }
`
