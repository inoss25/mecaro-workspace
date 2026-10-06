import { gql } from 'graphql-tag'
import { MAINTENANCE_SETTING_FIELDS } from './fragments'

export const CREATE_MAINTENANCE_SETTING = gql`
    mutation CreateMaintenanceSetting($input: MaintenanceSettingCreateInput!) {
        createMaintenanceSetting(input: $input) { ...MaintenanceSettingFields }
    }
    ${MAINTENANCE_SETTING_FIELDS}
`

export const UPDATE_MAINTENANCE_SETTING = gql`
    mutation UpdateMaintenanceSetting($id: ID!, $input: MaintenanceSettingUpdateInput!) {
        updateMaintenanceSetting(id: $id, input: $input) { ...MaintenanceSettingFields }
    }
    ${MAINTENANCE_SETTING_FIELDS}
`

export const DELETE_MAINTENANCE_SETTING = gql`
    mutation DeleteMaintenanceSetting($id: ID!) {
        deleteMaintenanceSetting(id: $id)
    }
`
