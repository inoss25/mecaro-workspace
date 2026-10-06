import { gql } from 'graphql-tag'

const RECORD_FIELDS = `
    id
    maintenance_date
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
`

export const MAINTENANCE_PART_FIELDS = gql`
    fragment MaintenancePartFields on MaintenancePart {
        id
        name
        reference
        quantity
        unit_price
        total_price
        brand
        notes
        created_at
        updated_at
        maintenanceRecord {
            ${RECORD_FIELDS}
        }
    }
`
