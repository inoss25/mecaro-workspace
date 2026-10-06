import { gql } from 'graphql-tag'
import { MAINTENANCE_SETTING_FIELDS } from './fragments'

const PAGINATOR_INFO_FIELDS = gql`
    fragment MaintenanceSettingPaginatorInfoFields on PaginatorInfo {
        count
        currentPage
        firstItem
        hasMorePages
        lastItem
        lastPage
        perPage
        total
    }
`

export const MAINTENANCE_SETTING_PAGINATE = gql`
    query MaintenanceSettingPaginate($input: MaintenanceSettingPaginatorInput) {
        maintenanceSettingPaginate(input: $input) {
            data { ...MaintenanceSettingFields }
            paginatorInfo { ...MaintenanceSettingPaginatorInfoFields }
        }
    }
    ${MAINTENANCE_SETTING_FIELDS}
    ${PAGINATOR_INFO_FIELDS}
`

export const MAINTENANCE_SETTING = gql`
    query MaintenanceSetting($id: ID!) {
        maintenanceSetting(id: $id) { ...MaintenanceSettingFields }
    }
    ${MAINTENANCE_SETTING_FIELDS}
`
