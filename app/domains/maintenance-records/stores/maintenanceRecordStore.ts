import { defineStore } from 'pinia'
import { MAINTENANCE_TYPES } from '../../maintenance-types/graphql/queries'
import type {
    MaintenanceType,
    MaintenanceTypesQueryResult,
    MaintenanceTypesQueryVariables,
} from '../../maintenance-types/types'
import { VEHICLES } from '../../vehicles/graphql/queries'
import type { Vehicle, VehiclesQueryResult, VehiclesQueryVariables } from '../../vehicles/types'
import { vehicleLabel } from '../../vehicles/utils/options'
import { CREATE_MAINTENANCE_RECORD, DELETE_MAINTENANCE_RECORD, UPDATE_MAINTENANCE_RECORD } from '../graphql/mutations'
import { MAINTENANCE_RECORD, MAINTENANCE_RECORD_PAGINATE, MAINTENANCE_RECORDS } from '../graphql/queries'
import type {
    CreateMaintenanceRecordMutationResult,
    CreateMaintenanceRecordMutationVariables,
    DeleteMaintenanceRecordMutationResult,
    DeleteMaintenanceRecordMutationVariables,
    MaintenanceRecord,
    MaintenanceRecordCreateInput,
    MaintenanceRecordFilterInput,
    MaintenanceRecordOrderInput,
    MaintenanceRecordPaginateQueryResult,
    MaintenanceRecordPaginateQueryVariables,
    MaintenanceRecordQueryResult,
    MaintenanceRecordQueryVariables,
    MaintenanceRecordsQueryResult,
    MaintenanceRecordsQueryVariables,
    MaintenanceRecordUpdateInput,
    PaginatorInfo,
    UpdateMaintenanceRecordMutationResult,
    UpdateMaintenanceRecordMutationVariables,
} from '../types'
import { orderByFromKey, type MaintenanceRecordOrderKey } from '../utils/options'

export const useMaintenanceRecordStore = defineStore('maintenanceRecord', () => {
    const items = ref<MaintenanceRecord[]>([])
    const paginatorInfo = ref<PaginatorInfo | null>(null)
    const vehicles = ref<Vehicle[]>([])
    const types = ref<MaintenanceType[]>([])
    const page = ref(1)
    const perPage = ref(10)
    const search = ref('')
    const vehicleId = ref('')
    const fixedVehicleId = ref<string | null>(null)
    const typeId = ref('')
    const orderKey = ref<MaintenanceRecordOrderKey>('date_desc')
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

    function buildVariables(): MaintenanceRecordPaginateQueryVariables {
        const filter: MaintenanceRecordFilterInput = {}
        const term = search.value.trim()
        if (term) filter.search = term

        const activeVehicleId = fixedVehicleId.value || vehicleId.value
        if (activeVehicleId) filter.vehicle_id = activeVehicleId
        if (typeId.value) filter.maintenance_type_id = typeId.value

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
            const response = await client.query<MaintenanceRecordPaginateQueryResult, MaintenanceRecordPaginateQueryVariables>({
                query: MAINTENANCE_RECORD_PAGINATE,
                variables,
                fetchPolicy: 'network-only',
            })
            if (current !== requestId) return

            items.value = response.data?.maintenanceRecordPaginate.data ?? []
            paginatorInfo.value = response.data?.maintenanceRecordPaginate.paginatorInfo ?? null
        }
        catch (cause) {
            if (current !== requestId) return
            error.value = cause
        }
        finally {
            if (current === requestId) loading.value = false
        }
    }

    async function fetchOptions() {
        optionsLoading.value = true
        optionsError.value = null

        try {
            const [vehicleResponse, typeResponse] = await Promise.all([
                client.query<VehiclesQueryResult, VehiclesQueryVariables>({
                    query: VEHICLES,
                    variables: {
                        filter: { is_active: true },
                        order_by: { column: 'CREATED_AT', order: 'DESC' },
                    },
                    fetchPolicy: 'network-only',
                }),
                client.query<MaintenanceTypesQueryResult, MaintenanceTypesQueryVariables>({
                    query: MAINTENANCE_TYPES,
                    variables: {
                        filter: { is_active: true },
                        order_by: { column: 'NAME', order: 'ASC' },
                    },
                    fetchPolicy: 'network-only',
                }),
            ])
            vehicles.value = vehicleResponse.data?.vehicles ?? []
            types.value = typeResponse.data?.maintenanceTypes ?? []
        }
        catch (cause) {
            optionsError.value = cause
        }
        finally {
            optionsLoading.value = false
        }
    }

    async function fetchAll(filter?: MaintenanceRecordFilterInput | null, orderBy?: MaintenanceRecordOrderInput | null) {
        const response = await client.query<MaintenanceRecordsQueryResult, MaintenanceRecordsQueryVariables>({
            query: MAINTENANCE_RECORDS,
            variables: {
                filter: filter ?? undefined,
                order_by: orderBy ?? { column: 'MAINTENANCE_DATE', order: 'DESC' },
            },
            fetchPolicy: 'network-only',
        })

        return response.data?.maintenanceRecords ?? []
    }

    async function find(id: string) {
        try {
            const response = await client.query<MaintenanceRecordQueryResult, MaintenanceRecordQueryVariables>({
                query: MAINTENANCE_RECORD,
                variables: { id },
                fetchPolicy: 'network-only',
            })
            return response.data?.maintenanceRecord ?? null
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

    function applyType(value: string) {
        if (typeId.value === value && page.value === 1) return
        typeId.value = value
        page.value = 1
        return fetchPage()
    }

    function applyOrder(value: MaintenanceRecordOrderKey) {
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

    function typeOptionLabel(type: MaintenanceType) {
        const category = type.category?.name
        return category ? `${category} — ${type.name}` : type.name
    }

    function create(input: MaintenanceRecordCreateInput) {
        return runMutation(async () => {
            const { data } = await client.mutate<CreateMaintenanceRecordMutationResult, CreateMaintenanceRecordMutationVariables>({
                mutation: CREATE_MAINTENANCE_RECORD,
                variables: { input },
            })

            const created = data?.createMaintenanceRecord
            if (!created) {
                mutationError.value = new Error('La création n’a pas renvoyé d’intervention.')
                return null
            }

            page.value = 1
            await fetchPage()
            return created
        })
    }

    function update(id: string, input: MaintenanceRecordUpdateInput) {
        return runMutation(async () => {
            const { data } = await client.mutate<UpdateMaintenanceRecordMutationResult, UpdateMaintenanceRecordMutationVariables>({
                mutation: UPDATE_MAINTENANCE_RECORD,
                variables: { id, input },
            })

            const updated = data?.updateMaintenanceRecord
            if (!updated) {
                mutationError.value = new Error('La modification n’a pas renvoyé d’intervention.')
                return null
            }

            await fetchPage()
            return updated
        })
    }

    function remove(id: string) {
        return runMutation(async () => {
            const { data } = await client.mutate<DeleteMaintenanceRecordMutationResult, DeleteMaintenanceRecordMutationVariables>({
                mutation: DELETE_MAINTENANCE_RECORD,
                variables: { id },
            })

            if (!data?.deleteMaintenanceRecord) {
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
        types,
        page,
        perPage,
        search,
        vehicleId,
        fixedVehicleId,
        typeId,
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
        fetchOptions,
        fetchAll,
        find,
        setFixedVehicleId,
        applySearch,
        applyVehicle,
        applyType,
        applyOrder,
        setPage,
        setPerPage,
        vehicleOptionLabel,
        typeOptionLabel,
        create,
        update,
        remove,
    }
})
