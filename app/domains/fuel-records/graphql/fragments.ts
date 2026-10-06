import { gql } from 'graphql-tag'

export const FUEL_RECORD_FIELDS = gql`
    fragment FuelRecordFields on FuelRecord {
        id
        fuel_type
        mileage
        quantity
        unit_price
        total_price
        fuel_date
        payment_method
        full_tank
        notes
        created_at
        updated_at
        deleted_at
        vehicle {
            id
            name
            registration_number
            custom_brand_name
            custom_model_name
            vehicleBrand: vehicle_brand {
                name
            }
            vehicleModel: vehicle_model {
                name
            }
        }
    }
`
