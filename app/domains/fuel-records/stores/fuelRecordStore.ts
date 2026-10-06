import { defineStore } from 'pinia'
import { VEHICLES } from '../../vehicles/graphql/queries'
import type { Vehicle, VehiclesQueryResult, VehiclesQueryVariables } from '../../vehicles/types'
import { vehicleLabel } from '../../vehicles/utils/options'
import { CREATE_FUEL_RECORD, DELETE_FUEL_RECORD, UPDATE_FUEL_RECORD } from '../graphql/mutations'
import { FUEL_RECORD, FUEL_RECORD_PAGINATE } from '../graphql/queries'
import type {
    CreateFuelRecordMutationResult,
    CreateFuelRecordMutationVariables,
    DeleteFuelRecordMutationResult,
    DeleteFuelRecordMutationVariables,
    FuelRecord,
    FuelRecordCreateInput,
    FuelRecordFilterInput,
    FuelRecordOrderInput,
    FuelRecordPaginateQueryResult,
    FuelRecordPaginateQueryVariables,
    FuelRecordQueryResult,
    FuelRecordQueryVariables,
    FuelRecordUpdateInput,
    FuelType,
    PaginatorInfo,
    UpdateFuelRecordMutationResult,
    UpdateFuelRecordMutationVariables,
} from '../types'
import { orderByFromKey, type FuelRecordOrderKey } from '../utils/options'

export const useFuelRecordStore = defineStore('fuelRecord', () => {
    const items = ref<FuelRecord[]>([])
    const paginatorInfo = ref<PaginatorInfo | null>(null)
    const vehicles = ref<Vehicle[]>([])
    const page = ref(1)
    const perPage = ref(10)
    const search = ref('')
    const vehicleId = ref('')
    const fixedVehicleId = ref<string | null>(null)
    const fuelType = ref<FuelType | ''>('')
    const fullTank = ref<'' | 'true' | 'false'>('')
    const orderKey = ref<FuelRecordOrderKey>('fuel_date_desc')
    const loading = ref(false)
    const optionsLoading = ref(false)
    const saving = ref(false)
    const error = ref<unknown>(null)
    const optionsError = ref<unknown>(null)
    const mutationError = ref<unknown>(null)

    const client = useApolloClient()
    const total = computed(() => paginatorInfo.value?.total ?? 0)

    let requestId = 0

    function clearMutationError() {
        mutationError.value = null
    }

    function buildVariables(): FuelRecordPaginateQueryVariables {
        const filter: FuelRecordFilterInput = {}
        const term = search.value.trim()
        if (term) filter.search = term

        const activeVehicleId = fixedVehicleId.value || vehicleId.value
        if (activeVehicleId) filter.vehicle_id = activeVehicleId
        if (fuelType.value) filter.fuel_type = fuelType.value
        if (fullTank.value === 'true') filter.full_tank = true
        if (fullTank.value === 'false') filter.full_tank = false

        return {
            input: {
                page: page.value,
                first: perPage.value,
                order_by: orderByFromKey(orderKey.value),
                ...(Object.keys(filter).length ? { filter } : {}),
            },
        }
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

    async function fetchPage() {
        const current = ++requestId
        const variables = buildVariables()
        loading.value = true
        error.value = null

        try {
            const response = await client.query<FuelRecordPaginateQueryResult, FuelRecordPaginateQueryVariables>({
                query: FUEL_RECORD_PAGINATE,
                variables,
                fetchPolicy: 'network-only',
            })
            if (current !== requestId) return

            items.value = response.data?.fuelRecordPaginate.data ?? []
            paginatorInfo.value = response.data?.fuelRecordPaginate.paginatorInfo ?? null
        }
        catch (cause) {
            if (current !== requestId) return
            error.value = cause
        }
        finally {
            if (current === requestId) loading.value = false
        }
    }

    async function fetchVehicles() {
        optionsLoading.value = true
        optionsError.value = null

        try {
            const response = await client.query<VehiclesQueryResult, VehiclesQueryVariables>({
                query: VEHICLES,
                variables: {
                    filter: { is_active: true },
                    order_by: { column: 'CREATED_AT', order: 'DESC' },
                },
                fetchPolicy: 'network-only',
            })
            vehicles.value = response.data?.vehicles ?? []
        }
        catch (cause) {
            optionsError.value = cause
        }
        finally {
            optionsLoading.value = false
        }
    }

    async function find(id: string) {
        try {
            const response = await client.query<FuelRecordQueryResult, FuelRecordQueryVariables>({
                query: FUEL_RECORD,
                variables: { id },
                fetchPolicy: 'network-only',
            })
            return response.data?.fuelRecord ?? null
        }
        catch {
            return null
        }
    }

    function setFixedVehicleId(value: string | null) {
        fixedVehicleId.value = value
        page.value = 1
        return fetchPage()
    }

    function applySearch(value: string) {
        const next = value.trim()
        if (search.value === next && page.value === 1) return
        search.value = next
        page.value = 1
        return fetchPage()
    }

    function applyVehicle(value: string) {
        if (fixedVehicleId.value) return
        if (vehicleId.value === value && page.value === 1) return
        vehicleId.value = value
        page.value = 1
        return fetchPage()
    }

    function applyFuelType(value: FuelType | '') {
        if (fuelType.value === value && page.value === 1) return
        fuelType.value = value
        page.value = 1
        return fetchPage()
    }

    function applyFullTank(value: '' | 'true' | 'false') {
        if (fullTank.value === value && page.value === 1) return
        fullTank.value = value
        page.value = 1
        return fetchPage()
    }

    function applyOrder(value: FuelRecordOrderKey) {
        if (orderKey.value === value && page.value === 1) return
        orderKey.value = value
        page.value = 1
        return fetchPage()
    }

    function setPage(value: number) {
        if (page.value === value) return
        page.value = value
        return fetchPage()
    }

    function setPerPage(value: number) {
        if (perPage.value === value) return
        perPage.value = value
        page.value = 1
        return fetchPage()
    }

    function vehicleOptionLabel(vehicle: Vehicle) {
        const label = vehicleLabel(vehicle)
        const plate = vehicle.registration_number?.trim()
        return plate ? `${label} (${plate})` : label
    }

    function create(input: FuelRecordCreateInput) {
        return runMutation(async () => {
            const { data } = await client.mutate<CreateFuelRecordMutationResult, CreateFuelRecordMutationVariables>({
                mutation: CREATE_FUEL_RECORD,
                variables: { input },
            })

            const created = data?.createFuelRecord
            if (!created) {
                mutationError.value = new Error('La création n’a pas renvoyé de plein.')
                return null
            }

            page.value = 1
            await fetchPage()
            return created
        })
    }

    function update(id: string, input: FuelRecordUpdateInput) {
        return runMutation(async () => {
            const { data } = await client.mutate<UpdateFuelRecordMutationResult, UpdateFuelRecordMutationVariables>({
                mutation: UPDATE_FUEL_RECORD,
                variables: { id, input },
            })

            const updated = data?.updateFuelRecord
            if (!updated) {
                mutationError.value = new Error('La modification n’a pas renvoyé de plein.')
                return null
            }

            await fetchPage()
            return updated
        })
    }

    function remove(id: string) {
        return runMutation(async () => {
            const { data } = await client.mutate<DeleteFuelRecordMutationResult, DeleteFuelRecordMutationVariables>({
                mutation: DELETE_FUEL_RECORD,
                variables: { id },
            })

            if (!data?.deleteFuelRecord) {
                mutationError.value = new Error('La suppression a échoué.')
                return null
            }

            await fetchPage()
            return true
        })
    }

    return {
        items,
        paginatorInfo,
        vehicles,
        page,
        perPage,
        search,
        vehicleId,
        fixedVehicleId,
        fuelType,
        fullTank,
        orderKey,
        loading,
        optionsLoading,
        saving,
        error,
        optionsError,
        mutationError,
        total,
        clearMutationError,
        fetchPage,
        fetchVehicles,
        find,
        setFixedVehicleId,
        applySearch,
        applyVehicle,
        applyFuelType,
        applyFullTank,
        applyOrder,
        setPage,
        setPerPage,
        vehicleOptionLabel,
        create,
        update,
        remove,
    }
})
