import { gql } from 'graphql-tag'
import { USER_FIELDS } from './fragments'

export const CREATE_USER = gql`
    mutation CreateUser($input: UserCreateInput!) {
        createUser(input: $input) {
            ...UserFields
        }
    }
    ${USER_FIELDS}
`

export const UPDATE_USER = gql`
    mutation UpdateUser($id: ID!, $input: UserUpdateInput!) {
        updateUser(id: $id, input: $input) {
            ...UserFields
        }
    }
    ${USER_FIELDS}
`

export const DELETE_USER = gql`
    mutation DeleteUser($id: ID!) {
        deleteUser(id: $id) {
            ...UserFields
        }
    }
    ${USER_FIELDS}
`

export const TOGGLE_USER_STATUS = gql`
    mutation ToggleUserStatus($id: ID!, $status: UserStatus!) {
        toggleUserStatus(id: $id, status: $status) {
            ...UserFields
        }
    }
    ${USER_FIELDS}
`

export const UPLOAD_USER_IMAGE = gql`
    mutation UploadUserImage($id: ID!, $image: Upload!) {
        uploadUserImage(id: $id, image: $image) {
            ...UserFields
        }
    }
    ${USER_FIELDS}
`

export const CHANGE_USER_PASSWORD = gql`
    mutation ChangeUserPassword(
        $id: ID!
        $current_password: String!
        $new_password: String!
        $confirm_new_password: String!
    ) {
        changeUserPassword(
            id: $id
            current_password: $current_password
            new_password: $new_password
            confirm_new_password: $confirm_new_password
        ) {
            ...UserFields
        }
    }
    ${USER_FIELDS}
`
