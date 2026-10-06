import { gql } from 'graphql-tag'
import { ADMINISTRATOR_FIELDS } from './fragments'

const PAGINATOR_INFO_FIELDS = gql`
    fragment PaginatorInfoFields on PaginatorInfo {
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

export const ADMINISTRATOR_PAGINATE = gql`
    query AdministratorPaginate($input: AdministratorPaginatorInput) {
        administratorPaginate(input: $input) {
            data {
                ...AdministratorFields
            }
            paginatorInfo {
                ...PaginatorInfoFields
            }
        }
    }
    ${ADMINISTRATOR_FIELDS}
    ${PAGINATOR_INFO_FIELDS}
`

export const ADMINISTRATORS = gql`
    query Administrators($filter: AdministratorFilterInput, $order_by: AdministratorOrderInput) {
        administrators(filter: $filter, order_by: $order_by) {
            ...AdministratorFields
        }
    }
    ${ADMINISTRATOR_FIELDS}
`

export const ADMINISTRATOR = gql`
    query Administrator($id: ID!) {
        administrator(id: $id) {
            ...AdministratorFields
        }
    }
    ${ADMINISTRATOR_FIELDS}
`
