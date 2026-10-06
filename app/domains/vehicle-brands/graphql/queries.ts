import { gql } from 'graphql-tag'
import { VEHICLE_BRAND_FIELDS } from './fragments'

const PAGINATOR_INFO_FIELDS = gql`
    fragment VehicleBrandPaginatorInfoFields on PaginatorInfo {
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

export const VEHICLE_BRAND_PAGINATE = gql`
    query VehicleBrandPaginate($input: VehicleBrandPaginatorInput) {
        vehicleBrandPaginate(input: $input) {
            data {
                ...VehicleBrandFields
            }
            paginatorInfo {
                ...VehicleBrandPaginatorInfoFields
            }
        }
    }
    ${VEHICLE_BRAND_FIELDS}
    ${PAGINATOR_INFO_FIELDS}
`

export const VEHICLE_BRANDS = gql`
    query VehicleBrands($filter: VehicleBrandFilterInput, $order_by: VehicleBrandOrderInput) {
        vehicleBrands(filter: $filter, order_by: $order_by) {
            ...VehicleBrandFields
        }
    }
    ${VEHICLE_BRAND_FIELDS}
`

export const VEHICLE_BRAND = gql`
    query VehicleBrand($id: ID!) {
        vehicleBrand(id: $id) {
            ...VehicleBrandFields
        }
    }
    ${VEHICLE_BRAND_FIELDS}
`
