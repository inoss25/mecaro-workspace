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

export const MAINTENANCE_OIL_FIELDS = gql`
    fragment MaintenanceOilFields on MaintenanceOil {
        id
        brand
        product_name
        viscosity
        quantity
        unit
        unit_price
        total_price
        notes
        created_at
        updated_at
        maintenance_record {
            ${RECORD_FIELDS}
        }
    }
`
