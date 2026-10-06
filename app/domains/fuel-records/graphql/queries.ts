import { gql } from 'graphql-tag'
import { FUEL_RECORD_FIELDS } from './fragments'

const PAGINATOR_INFO_FIELDS = gql`
    fragment FuelRecordPaginatorInfoFields on PaginatorInfo {
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

export const FUEL_RECORD_PAGINATE = gql`
    query FuelRecordPaginate($input: FuelRecordPaginatorInput) {
        fuelRecordPaginate(input: $input) {
            data {
                ...FuelRecordFields
            }
            paginatorInfo {
                ...FuelRecordPaginatorInfoFields
            }
        }
    }
    ${FUEL_RECORD_FIELDS}
    ${PAGINATOR_INFO_FIELDS}
`

export const FUEL_RECORDS = gql`
    query FuelRecords($filter: FuelRecordFilterInput, $order_by: FuelRecordOrderInput) {
        fuelRecords(filter: $filter, order_by: $order_by) {
            ...FuelRecordFields
        }
    }
    ${FUEL_RECORD_FIELDS}
`

export const FUEL_RECORD = gql`
    query FuelRecord($id: ID!) {
        fuelRecord(id: $id) {
            ...FuelRecordFields
        }
    }
    ${FUEL_RECORD_FIELDS}
`
