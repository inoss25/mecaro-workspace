import { gql } from 'graphql-tag'

export const MAINTENANCE_RECORD_FIELDS = gql`
    fragment MaintenanceRecordFields on MaintenanceRecord {
        id
        maintenance_date
        mileage
        cost
        description
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
        maintenance_type {
            id
            name
        }
        oils {
            id
        }
        parts {
            id
        }
    }
`
