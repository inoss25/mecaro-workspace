import { gql } from 'graphql-tag'
import { MAINTENANCE_TYPE_FIELDS } from './fragments'

const PAGINATOR_INFO_FIELDS = gql`
    fragment MaintenanceTypePaginatorInfoFields on PaginatorInfo {
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

export const MAINTENANCE_TYPE_PAGINATE = gql`
    query MaintenanceTypePaginate($input: MaintenanceTypePaginatorInput) {
        maintenanceTypePaginate(input: $input) {
            data {
                ...MaintenanceTypeFields
            }
            paginatorInfo {
                ...MaintenanceTypePaginatorInfoFields
            }
        }
    }
    ${MAINTENANCE_TYPE_FIELDS}
    ${PAGINATOR_INFO_FIELDS}
`

export const MAINTENANCE_TYPES = gql`
    query MaintenanceTypes($filter: MaintenanceTypeFilterInput, $order_by: MaintenanceTypeOrderInput) {
        maintenanceTypes(filter: $filter, order_by: $order_by) {
            ...MaintenanceTypeFields
        }
    }
    ${MAINTENANCE_TYPE_FIELDS}
`

export const MAINTENANCE_TYPE = gql`
    query MaintenanceType($id: ID!) {
        maintenanceType(id: $id) {
            ...MaintenanceTypeFields
        }
    }
    ${MAINTENANCE_TYPE_FIELDS}
`
