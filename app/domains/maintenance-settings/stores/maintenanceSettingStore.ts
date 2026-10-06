import { defineStore } from 'pinia'
import { MAINTENANCE_TYPES } from '../../maintenance-types/graphql/queries'
import type { MaintenanceType, MaintenanceTypesQueryResult, MaintenanceTypesQueryVariables } from '../../maintenance-types/types'
import { VEHICLES } from '../../vehicles/graphql/queries'
import type { Vehicle, VehiclesQueryResult, VehiclesQueryVariables } from '../../vehicles/types'
import { vehicleLabel } from '../../vehicles/utils/options'
import { CREATE_MAINTENANCE_SETTING, DELETE_MAINTENANCE_SETTING, UPDATE_MAINTENANCE_SETTING } from '../graphql/mutations'
import { MAINTENANCE_SETTING, MAINTENANCE_SETTING_PAGINATE } from '../graphql/queries'
import type {
    CreateMaintenanceSettingMutationResult,
    CreateMaintenanceSettingMutationVariables,
    DeleteMaintenanceSettingMutationResult,
    DeleteMaintenanceSettingMutationVariables,
    MaintenanceSetting,
    MaintenanceSettingCreateInput,
    MaintenanceSettingFilterInput,
    MaintenanceSettingPaginateQueryResult,
    MaintenanceSettingPaginateQueryVariables,
    MaintenanceSettingQueryResult,
    MaintenanceSettingQueryVariables,
    MaintenanceSettingUpdateInput,
    PaginatorInfo,
    UpdateMaintenanceSettingMutationResult,
    UpdateMaintenanceSettingMutationVariables,
} from '../types'
import { orderByFromKey, type MaintenanceSettingOrderKey } from '../utils/options'

export const useMaintenanceSettingStore = defineStore('maintenanceSetting', () => {
    const items = ref<MaintenanceSetting[]>([])
    const paginatorInfo = ref<PaginatorInfo | null>(null)
    const vehicles = ref<Vehicle[]>([])
    const types = ref<MaintenanceType[]>([])
    const page = ref(1)
    const perPage = ref(10)
    const vehicleId = ref('')
    const fixedVehicleId = ref<string | null>(null)
    const typeId = ref('')
    const isActive = ref<'' | 'true' | 'false'>('')
    const orderKey = ref<MaintenanceSettingOrderKey>('created_desc')
    const loading = ref(false)
    const optionsLoading = ref(false)
    const saving = ref(false)
    const error = ref<unknown>(null)
    const mutationError = ref<unknown>(null)
    const client = useApolloClient()
    const total = computed(() => paginatorInfo.value?.total ?? 0)
    let requestId = 0

    function clearMutationError() {
        mutationError.value = null
    }

    function buildVariables(): MaintenanceSettingPaginateQueryVariables {
        const filter: MaintenanceSettingFilterInput = {}
        const activeVehicleId = fixedVehicleId.value || vehicleId.value
        if (activeVehicleId) filter.vehicle_id = activeVehicleId
        if (typeId.value) filter.maintenance_type_id = typeId.value
        if (isActive.value === 'true') filter.is_active = true
        if (isActive.value === 'false') filter.is_active = false
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
        loading.value = true
        error.value = null
        try {
            const response = await client.query<MaintenanceSettingPaginateQueryResult, MaintenanceSettingPaginateQueryVariables>({
                query: MAINTENANCE_SETTING_PAGINATE,
                variables: buildVariables(),
                fetchPolicy: 'network-only',
            })
            if (current !== requestId) return
            items.value = response.data?.maintenanceSettingPaginate.data ?? []
            paginatorInfo.value = response.data?.maintenanceSettingPaginate.paginatorInfo ?? null
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
        try {
            const [vehicleResponse, typeResponse] = await Promise.all([
                client.query<VehiclesQueryResult, VehiclesQueryVariables>({
                    query: VEHICLES,
                    variables: { filter: { is_active: true }, order_by: { column: 'CREATED_AT', order: 'DESC' } },
                    fetchPolicy: 'network-only',
                }),
                client.query<MaintenanceTypesQueryResult, MaintenanceTypesQueryVariables>({
                    query: MAINTENANCE_TYPES,
                    variables: { filter: { is_active: true }, order_by: { column: 'NAME', order: 'ASC' } },
                    fetchPolicy: 'network-only',
                }),
            ])
            vehicles.value = vehicleResponse.data?.vehicles ?? []
            types.value = typeResponse.data?.maintenanceTypes ?? []
        }
        catch {
            vehicles.value = []
            types.value = []
        }
        finally {
            optionsLoading.value = false
        }
    }

    async function find(id: string) {
        try {
            const response = await client.query<MaintenanceSettingQueryResult, MaintenanceSettingQueryVariables>({
                query: MAINTENANCE_SETTING,
                variables: { id },
                fetchPolicy: 'network-only',
            })
            return response.data?.maintenanceSetting ?? null
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

    function applyIsActive(value: '' | 'true' | 'false') {
        if (isActive.value === value && page.value === 1) return
        isActive.value = value
        page.value = 1
        return fetchPage()
    }

    function applyOrder(value: MaintenanceSettingOrderKey) {
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
        return type.category?.name ? `${type.category.name} — ${type.name}` : type.name
    }

    function create(input: MaintenanceSettingCreateInput) {
        return runMutation(async () => {
            const { data } = await client.mutate<CreateMaintenanceSettingMutationResult, CreateMaintenanceSettingMutationVariables>({
                mutation: CREATE_MAINTENANCE_SETTING,
                variables: { input },
            })
            const created = data?.createMaintenanceSetting
            if (!created) {
                mutationError.value = new Error('La création n’a pas renvoyé d’intervalle.')
                return null
            }
            page.value = 1
            await fetchPage()
            return created
        })
    }

    function update(id: string, input: MaintenanceSettingUpdateInput) {
        return runMutation(async () => {
            const { data } = await client.mutate<UpdateMaintenanceSettingMutationResult, UpdateMaintenanceSettingMutationVariables>({
                mutation: UPDATE_MAINTENANCE_SETTING,
                variables: { id, input },
            })
            const updated = data?.updateMaintenanceSetting
            if (!updated) {
                mutationError.value = new Error('La modification n’a pas renvoyé d’intervalle.')
                return null
            }
            await fetchPage()
            return updated
        })
    }

    function remove(id: string) {
        return runMutation(async () => {
            const { data } = await client.mutate<DeleteMaintenanceSettingMutationResult, DeleteMaintenanceSettingMutationVariables>({
                mutation: DELETE_MAINTENANCE_SETTING,
                variables: { id },
            })
            if (!data?.deleteMaintenanceSetting) {
                mutationError.value = new Error('La suppression a échoué.')
                return null
            }
            await fetchPage()
            return true
        })
    }

    return {
        items, paginatorInfo, vehicles, types, page, perPage, vehicleId, fixedVehicleId, typeId, isActive, orderKey,
        loading, optionsLoading, saving, error, mutationError, total,
        clearMutationError, fetchPage, fetchOptions, find, setFixedVehicleId, applyVehicle, applyType, applyIsActive, applyOrder,
        setPage, setPerPage, vehicleOptionLabel, typeOptionLabel, create, update, remove,
    }
})
