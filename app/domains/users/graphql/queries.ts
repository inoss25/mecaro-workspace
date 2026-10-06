import { gql } from 'graphql-tag'
import { USER_FIELDS } from './fragments'

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

export const USER_PAGINATE = gql`
    query UserPaginate($input: UserPaginatorInput) {
        userPaginate(input: $input) {
            data {
                ...UserFields
            }
            paginatorInfo {
                ...PaginatorInfoFields
            }
        }
    }
    ${USER_FIELDS}
    ${PAGINATOR_INFO_FIELDS}
`

export const USERS = gql`
    query Users($filter: UserFilterInput, $order_by: UserOrderInput) {
        users(filter: $filter, order_by: $order_by) {
            ...UserFields
        }
    }
    ${USER_FIELDS}
`

export const USER = gql`
    query User($id: ID!) {
        user(id: $id) {
            ...UserFields
        }
    }
    ${USER_FIELDS}
`
