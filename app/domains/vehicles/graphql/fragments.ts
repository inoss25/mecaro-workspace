import { gql } from 'graphql-tag'

export const VEHICLE_FIELDS = gql`
    fragment VehicleFields on Vehicle {
        id
        custom_brand_name
        custom_model_name
        engine_capacity
        transmission
        name
        registration_number
        fuel_type
        color
        purchase_date
        manufacture_year
        image_path
        initial_mileage
        current_mileage
        is_active
        created_at
        updated_at
        deleted_at
        user {
            id
            name
            first_name
            last_name
            image_url
        }
        vehicleType: vehicle_type {
            id
            name
            key
            icon
        }
        vehicleBrand: vehicle_brand {
            id
            name
            key
        }
        vehicleModel: vehicle_model {
            id
            name
            key
        }
    }
`
