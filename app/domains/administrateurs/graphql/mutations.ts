import { gql } from 'graphql-tag'
import { ADMINISTRATOR_FIELDS } from './fragments'

export const CREATE_ADMINISTRATOR = gql`
    mutation CreateAdministrator($input: AdministratorCreateInput!) {
        createAdministrator(input: $input) {
            ...AdministratorFields
        }
    }
    ${ADMINISTRATOR_FIELDS}
`

export const UPDATE_ADMINISTRATOR = gql`
    mutation UpdateAdministrator($id: ID!, $input: AdministratorUpdateInput!) {
        updateAdministrator(id: $id, input: $input) {
            ...AdministratorFields
        }
    }
    ${ADMINISTRATOR_FIELDS}
`

export const DELETE_ADMINISTRATOR = gql`
    mutation DeleteAdministrator($id: ID!) {
        deleteAdministrator(id: $id) {
            ...AdministratorFields
        }
    }
    ${ADMINISTRATOR_FIELDS}
`

export const TOGGLE_ADMINISTRATOR_STATUS = gql`
    mutation ToggleAdministratorStatus($id: ID!, $status: AdministratorStatus!) {
        toggleAdministratorStatus(id: $id, status: $status) {
            ...AdministratorFields
        }
    }
    ${ADMINISTRATOR_FIELDS}
`

export const UPLOAD_ADMINISTRATOR_IMAGE = gql`
    mutation UploadAdministratorImage($id: ID!, $image: Upload!) {
        uploadAdministratorImage(id: $id, image: $image) {
            ...AdministratorFields
        }
    }
    ${ADMINISTRATOR_FIELDS}
`

export const CHANGE_ADMINISTRATOR_PASSWORD = gql`
    mutation ChangeAdministratorPassword(
        $id: ID!
        $current_password: String!
        $new_password: String!
        $confirm_new_password: String!
    ) {
        changeAdministratorPassword(
            id: $id
            current_password: $current_password
            new_password: $new_password
            confirm_new_password: $confirm_new_password
        ) {
            ...AdministratorFields
        }
    }
    ${ADMINISTRATOR_FIELDS}
`
