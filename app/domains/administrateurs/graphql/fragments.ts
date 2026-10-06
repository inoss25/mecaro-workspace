import { gql } from 'graphql-tag'

export const ADMINISTRATOR_FIELDS = gql`
    fragment AdministratorFields on Administrator {
        id
        first_name
        last_name
        name
        initial_name
        email
        email_verified_at
        status
        gender
        birth_date
        image_url
        created_at
        updated_at
        deleted_at
    }
`
