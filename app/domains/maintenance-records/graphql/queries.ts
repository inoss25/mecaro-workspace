import { gql } from 'graphql-tag'
import { MAINTENANCE_RECORD_FIELDS } from './fragments'

const PAGINATOR_INFO_FIELDS = gql`
    fragment MaintenanceRecordPaginatorInfoFields on PaginatorInfo {
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

export const MAINTENANCE_RECORD_PAGINATE = gql`
    query MaintenanceRecordPaginate($input: MaintenanceRecordPaginatorInput) {
        maintenanceRecordPaginate(input: $input) {
            data {
                ...MaintenanceRecordFields
            }
            paginatorInfo {
                ...MaintenanceRecordPaginatorInfoFields
            }
        }
    }
    ${MAINTENANCE_RECORD_FIELDS}
    ${PAGINATOR_INFO_FIELDS}
`

export const MAINTENANCE_RECORDS = gql`
    query MaintenanceRecords($filter: MaintenanceRecordFilterInput, $order_by: MaintenanceRecordOrderInput) {
        maintenanceRecords(filter: $filter, order_by: $order_by) {
            ...MaintenanceRecordFields
        }
    }
    ${MAINTENANCE_RECORD_FIELDS}
`

export const MAINTENANCE_RECORD = gql`
    query MaintenanceRecord($id: ID!) {
        maintenanceRecord(id: $id) {
            ...MaintenanceRecordFields
        }
    }
    ${MAINTENANCE_RECORD_FIELDS}
`
