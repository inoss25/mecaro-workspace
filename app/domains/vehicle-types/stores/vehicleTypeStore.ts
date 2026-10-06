import { defineStore } from 'pinia'
import { CREATE_VEHICLE_TYPE, DELETE_VEHICLE_TYPE, UPDATE_VEHICLE_TYPE } from '../graphql/mutations'
import { VEHICLE_TYPES } from '../graphql/queries'
import type {
    CreateVehicleTypeMutationResult,
    CreateVehicleTypeMutationVariables,
    DeleteVehicleTypeMutationResult,
    DeleteVehicleTypeMutationVariables,
    UpdateVehicleTypeMutationResult,
    UpdateVehicleTypeMutationVariables,
    VehicleType,
    VehicleTypeCreateInput,
    VehicleTypeUpdateInput,
    VehicleTypesQueryResult,
} from '../types'

export const useVehicleTypeStore = defineStore('vehicleType', () => {
    const items = ref<VehicleType[]>([])
    const loading = ref(false)
    const saving = ref(false)
    const error = ref<unknown>(null)
    const mutationError = ref<unknown>(null)

    const client = useApolloClient()

    function clearMutationError() {
        mutationError.value = null
    }

    async function runMutation<T>(action: () => Promise<T | null>) {
        saving.value = true
        mutationError.value = null

        try {
            return await action()
        }
        catch (cause) {
            mutationError.value = cause
            return null
        }
        finally {
            saving.value = false
        }
    }

    async function fetchAll() {
        loading.value = true
        error.value = null

        try {
            const response = await client.query<VehicleTypesQueryResult>({
                query: VEHICLE_TYPES,
                fetchPolicy: 'network-only',
            })
            items.value = response.data?.vehicleTypes ?? []
        }
        catch (cause) {
            error.value = cause
            items.value = []
        }
        finally {
            loading.value = false
        }
    }

    function create(input: VehicleTypeCreateInput) {
        return runMutation(async () => {
            const { data } = await client.mutate<CreateVehicleTypeMutationResult, CreateVehicleTypeMutationVariables>({
                mutation: CREATE_VEHICLE_TYPE,
                variables: { input },
            })

            const created = data?.createVehicleType
            if (!created) {
                mutationError.value = new Error('La création n’a pas renvoyé de type de véhicule.')
                return null
            }

            items.value = [created, ...items.value.filter(item => item.id !== created.id)]
            return created
        })
    }

    function update(id: string, input: VehicleTypeUpdateInput) {
        return runMutation(async () => {
            const { data } = await client.mutate<UpdateVehicleTypeMutationResult, UpdateVehicleTypeMutationVariables>({
                mutation: UPDATE_VEHICLE_TYPE,
                variables: { id, input },
            })

            const updated = data?.updateVehicleType
            if (!updated) {
                mutationError.value = new Error('La modification n’a pas renvoyé de type de véhicule.')
                return null
            }

            const index = items.value.findIndex(item => item.id === updated.id)
            if (index === -1) items.value = [updated, ...items.value]
            else items.value[index] = updated

            return updated
        })
    }

    function remove(id: string) {
        return runMutation(async () => {
            const { data } = await client.mutate<DeleteVehicleTypeMutationResult, DeleteVehicleTypeMutationVariables>({
                mutation: DELETE_VEHICLE_TYPE,
                variables: { id },
            })

            const deleted = data?.deleteVehicleType
            if (!deleted) {
                mutationError.value = new Error('La suppression n’a pas renvoyé de type de véhicule.')
                return null
            }

            items.value = items.value.filter(item => item.id !== deleted.id)
            return deleted
        })
    }

    return {
        items,
        loading,
        saving,
        error,
        mutationError,
        clearMutationError,
        fetchAll,
        create,
        update,
        remove,
    }
})
