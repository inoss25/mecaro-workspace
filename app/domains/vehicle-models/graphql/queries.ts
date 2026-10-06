import { gql } from 'graphql-tag'
import { VEHICLE_MODEL_FIELDS } from './fragments'

const PAGINATOR_INFO_FIELDS = gql`
    fragment VehicleModelPaginatorInfoFields on PaginatorInfo {
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

export const VEHICLE_MODEL_PAGINATE = gql`
    query VehicleModelPaginate($input: VehicleModelPaginatorInput) {
        vehicleModelPaginate(input: $input) {
            data {
                ...VehicleModelFields
            }
            paginatorInfo {
                ...VehicleModelPaginatorInfoFields
            }
        }
    }
    ${VEHICLE_MODEL_FIELDS}
    ${PAGINATOR_INFO_FIELDS}
`

export const VEHICLE_MODELS = gql`
    query VehicleModels($filter: VehicleModelFilterInput, $order_by: VehicleModelOrderInput) {
        vehicleModels(filter: $filter, order_by: $order_by) {
            ...VehicleModelFields
        }
    }
    ${VEHICLE_MODEL_FIELDS}
`

export const VEHICLE_MODEL = gql`
    query VehicleModel($id: ID!) {
        vehicleModel(id: $id) {
            ...VehicleModelFields
        }
    }
    ${VEHICLE_MODEL_FIELDS}
`
