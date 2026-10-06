import type { Ref } from 'vue'
import type { Vehicle } from '../types'

export interface VehicleDetailContext {
    id: Ref<string>
    vehicle: Ref<Vehicle | null>
    loading: Ref<boolean>
    error: Ref<unknown>
    refresh: () => Promise<void>
}

const vehicleDetailKey = Symbol('vehicleDetail')

export function provideVehicleDetail(context: VehicleDetailContext) {
    provide(vehicleDetailKey, context)
}

export function useVehicleDetail() {
    const context = inject<VehicleDetailContext | null>(vehicleDetailKey, null)
    if (!context) {
        throw new Error('useVehicleDetail() doit être utilisé sous la page véhicule /vehicles/:id.')
    }
    return context
}
