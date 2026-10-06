import { gql } from 'graphql-tag'
import { MAINTENANCE_CATEGORY_FIELDS } from './fragments'

const PAGINATOR_INFO_FIELDS = gql`
    fragment MaintenanceCategoryPaginatorInfoFields on PaginatorInfo {
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

export const MAINTENANCE_CATEGORY_PAGINATE = gql`
    query MaintenanceCategoryPaginate($input: MaintenanceCategoryPaginatorInput) {
        maintenanceCategoryPaginate(input: $input) {
            data {
                ...MaintenanceCategoryFields
            }
            paginatorInfo {
                ...MaintenanceCategoryPaginatorInfoFields
            }
        }
    }
    ${MAINTENANCE_CATEGORY_FIELDS}
    ${PAGINATOR_INFO_FIELDS}
`

export const MAINTENANCE_CATEGORIES = gql`
    query MaintenanceCategories($filter: MaintenanceCategoryFilterInput, $order_by: MaintenanceCategoryOrderInput) {
        maintenanceCategories(filter: $filter, order_by: $order_by) {
            ...MaintenanceCategoryFields
        }
    }
    ${MAINTENANCE_CATEGORY_FIELDS}
`

export const MAINTENANCE_CATEGORY = gql`
    query MaintenanceCategory($id: ID!) {
        maintenanceCategory(id: $id) {
            ...MaintenanceCategoryFields
        }
    }
    ${MAINTENANCE_CATEGORY_FIELDS}
`
