import { gql } from 'graphql-tag'
import { MAINTENANCE_PART_FIELDS } from './fragments'

const PAGINATOR_INFO_FIELDS = gql`
    fragment MaintenancePartPaginatorInfoFields on PaginatorInfo {
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

export const MAINTENANCE_PART_PAGINATE = gql`
    query MaintenancePartPaginate($input: MaintenancePartPaginatorInput) {
        maintenancePartPaginate(input: $input) {
            data { ...MaintenancePartFields }
            paginatorInfo { ...MaintenancePartPaginatorInfoFields }
        }
    }
    ${MAINTENANCE_PART_FIELDS}
    ${PAGINATOR_INFO_FIELDS}
`

export const MAINTENANCE_PART = gql`
    query MaintenancePart($id: ID!) {
        maintenancePart(id: $id) { ...MaintenancePartFields }
    }
    ${MAINTENANCE_PART_FIELDS}
`
