import { gql } from 'graphql-tag'
import { MAINTENANCE_PART_FIELDS } from './fragments'

export const CREATE_MAINTENANCE_PART = gql`
    mutation CreateMaintenancePart($input: MaintenancePartCreateInput!) {
        createMaintenancePart(input: $input) { ...MaintenancePartFields }
    }
    ${MAINTENANCE_PART_FIELDS}
`

export const UPDATE_MAINTENANCE_PART = gql`
    mutation UpdateMaintenancePart($id: ID!, $input: MaintenancePartUpdateInput!) {
        updateMaintenancePart(id: $id, input: $input) { ...MaintenancePartFields }
    }
    ${MAINTENANCE_PART_FIELDS}
`

export const DELETE_MAINTENANCE_PART = gql`
    mutation DeleteMaintenancePart($id: ID!) {
        deleteMaintenancePart(id: $id)
    }
`
