import { gql } from 'graphql-tag'

export const MAINTENANCE_SETTING_FIELDS = gql`
    fragment MaintenanceSettingFields on MaintenanceSetting {
        id
        interval_km
        is_active
        created_at
        updated_at
        vehicle {
            id
            name
            registration_number
            custom_brand_name
            custom_model_name
            vehicleBrand: vehicle_brand { name }
            vehicleModel: vehicle_model { name }
        }
        maintenance_type { id name }
    }
`
