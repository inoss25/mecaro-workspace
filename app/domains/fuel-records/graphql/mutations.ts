import { gql } from 'graphql-tag'
import { FUEL_RECORD_FIELDS } from './fragments'

export const CREATE_FUEL_RECORD = gql`
    mutation CreateFuelRecord($input: FuelRecordCreateInput!) {
        createFuelRecord(input: $input) {
            ...FuelRecordFields
        }
    }
    ${FUEL_RECORD_FIELDS}
`

export const UPDATE_FUEL_RECORD = gql`
    mutation UpdateFuelRecord($id: ID!, $input: FuelRecordUpdateInput!) {
        updateFuelRecord(id: $id, input: $input) {
            ...FuelRecordFields
        }
    }
    ${FUEL_RECORD_FIELDS}
`

export const DELETE_FUEL_RECORD = gql`
    mutation DeleteFuelRecord($id: ID!) {
        deleteFuelRecord(id: $id)
    }
`
