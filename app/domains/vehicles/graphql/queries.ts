import { gql } from 'graphql-tag'
import { VEHICLE_FIELDS } from './fragments'

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

export const VEHICLE_PAGINATE = gql`
    query VehiclePaginate($input: VehiclePaginatorInput) {
        vehiclePaginate(input: $input) {
            data {
                ...VehicleFields
            }
            paginatorInfo {
                ...PaginatorInfoFields
            }
        }
    }
    ${VEHICLE_FIELDS}
    ${PAGINATOR_INFO_FIELDS}
`

export const VEHICLES = gql`
    query Vehicles($filter: VehicleFilterInput, $order_by: VehicleOrderInput) {
        vehicles(filter: $filter, order_by: $order_by) {
            ...VehicleFields
        }
    }
    ${VEHICLE_FIELDS}
`

export const VEHICLE = gql`
    query Vehicle($id: ID!) {
        vehicle(id: $id) {
            ...VehicleFields
        }
    }
    ${VEHICLE_FIELDS}
`
