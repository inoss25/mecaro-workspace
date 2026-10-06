import { gql } from 'graphql-tag'

export const USER_FIELDS = gql`
    fragment UserFields on User {
        id
        first_name
        last_name
        name
        initial_name
        email
        phone_number
        gender
        birth_date
        email_verified_at
        phone_number_verified_at
        image_url
        status
        created_at
        updated_at
    }
`
