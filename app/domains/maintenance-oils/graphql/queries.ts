import { gql } from 'graphql-tag'
import { MAINTENANCE_OIL_FIELDS } from './fragments'

const PAGINATOR_INFO_FIELDS = gql`
    fragment MaintenanceOilPaginatorInfoFields on PaginatorInfo {
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

export const MAINTENANCE_OIL_PAGINATE = gql`
    query MaintenanceOilPaginate($input: MaintenanceOilPaginatorInput) {
        maintenanceOilPaginate(input: $input) {
            data { ...MaintenanceOilFields }
            paginatorInfo { ...MaintenanceOilPaginatorInfoFields }
        }
    }
    ${MAINTENANCE_OIL_FIELDS}
    ${PAGINATOR_INFO_FIELDS}
`

export const MAINTENANCE_OIL = gql`
    query MaintenanceOil($id: ID!) {
        maintenanceOil(id: $id) { ...MaintenanceOilFields }
    }
    ${MAINTENANCE_OIL_FIELDS}
`
