import { gql } from 'graphql-tag'
import { MAINTENANCE_RECORD_FIELDS } from './fragments'

export const CREATE_MAINTENANCE_RECORD = gql`
    mutation CreateMaintenanceRecord($input: MaintenanceRecordCreateInput!) {
        createMaintenanceRecord(input: $input) {
            ...MaintenanceRecordFields
        }
    }
    ${MAINTENANCE_RECORD_FIELDS}
`

export const UPDATE_MAINTENANCE_RECORD = gql`
    mutation UpdateMaintenanceRecord($id: ID!, $input: MaintenanceRecordUpdateInput!) {
        updateMaintenanceRecord(id: $id, input: $input) {
            ...MaintenanceRecordFields
        }
    }
    ${MAINTENANCE_RECORD_FIELDS}
`

export const DELETE_MAINTENANCE_RECORD = gql`
    mutation DeleteMaintenanceRecord($id: ID!) {
        deleteMaintenanceRecord(id: $id)
    }
`
