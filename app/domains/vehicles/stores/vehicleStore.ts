import { defineStore } from 'pinia'
import { USERS } from '../../users/graphql/queries'
import type { User, UsersQueryResult, UsersQueryVariables } from '../../users/types'
import { VEHICLE_BRANDS } from '../../vehicle-brands/graphql/queries'
import type { VehicleBrand, VehicleBrandsQueryResult, VehicleBrandsQueryVariables } from '../../vehicle-brands/types'
import { VEHICLE_MODELS } from '../../vehicle-models/graphql/queries'
import type { VehicleModel, VehicleModelsQueryResult, VehicleModelsQueryVariables } from '../../vehicle-models/types'
import { VEHICLE_TYPES } from '../../vehicle-types/graphql/queries'
import type { VehicleType, VehicleTypesQueryResult, VehicleTypesQueryVariables } from '../../vehicle-types/types'
import { CREATE_VEHICLE, DELETE_VEHICLE, UPDATE_VEHICLE } from '../graphql/mutations'
import { VEHICLE, VEHICLE_PAGINATE, VEHICLES } from '../graphql/queries'
import type {
    CreateVehicleMutationResult,
    CreateVehicleMutationVariables,
    DeleteVehicleMutationResult,
    DeleteVehicleMutationVariables,
    FuelType,
    PaginatorInfo,
    UpdateVehicleMutationResult,
    UpdateVehicleMutationVariables,
    Vehicle,
    VehicleCreateInput,
    VehicleFilterInput,
    VehicleOrderInput,
    VehiclePaginateQueryResult,
    VehiclePaginateQueryVariables,
    VehicleQueryResult,
    VehicleQueryVariables,
    VehiclesQueryResult,
    VehiclesQueryVariables,
    VehicleUpdateInput,
} from '../types'
import { orderByFromKey, type VehicleOrderKey } from '../utils/options'

export const useVehicleStore = defineStore('vehicle', () => {
    const items = ref<Vehicle[]>([])
    const paginatorInfo = ref<PaginatorInfo | null>(null)
    const page = ref(1)
    const perPage = ref(10)
    const search = ref('')
    const fuelType = ref<FuelType | ''>('')
    const isActive = ref<'' | 'true' | 'false'>('')
    const vehicleTypeId = ref('')
    const vehicleBrandId = ref('')
    const orderKey = ref<VehicleOrderKey>('created_desc')
    const users = ref<User[]>([])
    const vehicleTypes = ref<VehicleType[]>([])
    const vehicleBrands = ref<VehicleBrand[]>([])
    const vehicleModels = ref<VehicleModel[]>([])
    const loading = ref(false)
    const optionsLoading = ref(false)
    const modelsLoading = ref(false)
    const saving = ref(false)
    const error = ref<unknown>(null)
    const optionsError = ref<unknown>(null)
    const mutationError = ref<unknown>(null)

    const client = useApolloClient()
    const uploadClient = import.meta.client ? useApolloUploadClient() : null
    const total = computed(() => paginatorInfo.value?.total ?? 0)

    let requestId = 0

    function clearMutationError() {
        mutationError.value = null
    }

    function buildVariables(): VehiclePaginateQueryVariables {
        const filter: VehicleFilterInput = {}
        const term = search.value.trim()
        if (term) filter.search = term
        if (fuelType.value) filter.fuel_type = fuelType.value
        if (isActive.value === 'true') filter.is_active = true
        if (isActive.value === 'false') filter.is_active = false
        if (vehicleTypeId.value) filter.vehicle_type_id = vehicleTypeId.value
        if (vehicleBrandId.value) filter.vehicle_brand_id = vehicleBrandId.value

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
            const response = await client.query<VehiclePaginateQueryResult, VehiclePaginateQueryVariables>({
                query: VEHICLE_PAGINATE,
                variables,
                fetchPolicy: 'network-only',
            })
            if (current !== requestId) return

            items.value = response.data?.vehiclePaginate.data ?? []
            paginatorInfo.value = response.data?.vehiclePaginate.paginatorInfo ?? null
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
            const [usersResponse, typesResponse, brandsResponse] = await Promise.all([
                client.query<UsersQueryResult, UsersQueryVariables>({
                    query: USERS,
                    variables: {
                        order_by: { column: 'LAST_NAME', order: 'ASC' },
                    },
                    fetchPolicy: 'network-only',
                }),
                client.query<VehicleTypesQueryResult, VehicleTypesQueryVariables>({
                    query: VEHICLE_TYPES,
                    fetchPolicy: 'network-only',
                }),
                client.query<VehicleBrandsQueryResult, VehicleBrandsQueryVariables>({
                    query: VEHICLE_BRANDS,
                    variables: {
                        order_by: { column: 'NAME', order: 'ASC' },
                    },
                    fetchPolicy: 'network-only',
                }),
            ])

            users.value = usersResponse.data?.users ?? []
            vehicleTypes.value = typesResponse.data?.vehicleTypes ?? []
            vehicleBrands.value = brandsResponse.data?.vehicleBrands ?? []
            vehicleModels.value = []
        }
        catch (cause) {
            optionsError.value = cause
        }
        finally {
            optionsLoading.value = false
        }
    }

    async function fetchModelsForBrand(brandId: string) {
        if (!brandId) {
            vehicleModels.value = []
            return
        }

        modelsLoading.value = true

        try {
            const response = await client.query<VehicleModelsQueryResult, VehicleModelsQueryVariables>({
                query: VEHICLE_MODELS,
                variables: {
                    filter: { vehicle_brand_id: brandId },
                    order_by: { column: 'NAME', order: 'ASC' },
                },
                fetchPolicy: 'network-only',
            })
            vehicleModels.value = response.data?.vehicleModels ?? []
        }
        catch {
            vehicleModels.value = []
        }
        finally {
            modelsLoading.value = false
        }
    }

    async function fetchAll(filter?: VehicleFilterInput | null, orderBy?: VehicleOrderInput | null) {
        const response = await client.query<VehiclesQueryResult, VehiclesQueryVariables>({
            query: VEHICLES,
            variables: {
                filter: filter ?? undefined,
                order_by: orderBy ?? { column: 'CREATED_AT', order: 'DESC' },
            },
            fetchPolicy: 'network-only',
        })

        return response.data?.vehicles ?? []
    }

    async function find(id: string) {
        try {
            const response = await client.query<VehicleQueryResult, VehicleQueryVariables>({
                query: VEHICLE,
                variables: { id },
                fetchPolicy: 'network-only',
            })
            return response.data?.vehicle ?? null
        }
        catch {
            return null
        }
    }

    function applySearch(value: string) {
        const next = value.trim()
        if (search.value === next && page.value === 1) return
        search.value = next
        page.value = 1
        return fetchPage()
    }

    function applyFuelType(value: FuelType | '') {
        if (fuelType.value === value && page.value === 1) return
        fuelType.value = value
        page.value = 1
        return fetchPage()
    }

    function applyIsActive(value: '' | 'true' | 'false') {
        if (isActive.value === value && page.value === 1) return
        isActive.value = value
        page.value = 1
        return fetchPage()
    }

    function applyVehicleType(value: string) {
        if (vehicleTypeId.value === value && page.value === 1) return
        vehicleTypeId.value = value
        page.value = 1
        return fetchPage()
    }

    function applyVehicleBrand(value: string) {
        if (vehicleBrandId.value === value && page.value === 1) return
        vehicleBrandId.value = value
        page.value = 1
        return fetchPage()
    }

    function applyOrder(value: VehicleOrderKey) {
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

    function create(input: VehicleCreateInput) {
        return runMutation(async () => {
            if (!uploadClient) {
                mutationError.value = new Error('L’envoi de l’image est disponible dans le navigateur.')
                return null
            }

            const { data } = await uploadClient.mutate<CreateVehicleMutationResult, CreateVehicleMutationVariables>({
                mutation: CREATE_VEHICLE,
                variables: { input },
            })

            const created = data?.createVehicle
            if (!created) {
                mutationError.value = new Error('La création n’a pas renvoyé de véhicule.')
                return null
            }

            page.value = 1
            await fetchPage()
            return created
        })
    }

    function update(id: string, input: VehicleUpdateInput, image?: File | null) {
        return runMutation(async () => {
            const apollo = image ? uploadClient : client
            if (!apollo) {
                mutationError.value = new Error('L’envoi de l’image est disponible dans le navigateur.')
                return null
            }

            const { data } = await apollo.mutate<UpdateVehicleMutationResult, UpdateVehicleMutationVariables>({
                mutation: UPDATE_VEHICLE,
                variables: {
                    id,
                    input: image ? { ...input, image } : input,
                },
            })

            const updated = data?.updateVehicle
            if (!updated) {
                mutationError.value = new Error('La modification n’a pas renvoyé de véhicule.')
                return null
            }

            await fetchPage()
            return updated
        })
    }

    function remove(id: string) {
        return runMutation(async () => {
            const { data } = await client.mutate<DeleteVehicleMutationResult, DeleteVehicleMutationVariables>({
                mutation: DELETE_VEHICLE,
                variables: { id },
            })

            if (!data?.deleteVehicle) {
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
        page,
        perPage,
        search,
        fuelType,
        isActive,
        vehicleTypeId,
        vehicleBrandId,
        orderKey,
        users,
        vehicleTypes,
        vehicleBrands,
        vehicleModels,
        loading,
        optionsLoading,
        modelsLoading,
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
        applySearch,
        applyFuelType,
        applyIsActive,
        applyVehicleType,
        applyVehicleBrand,
        fetchModelsForBrand,
        applyOrder,
        setPage,
        setPerPage,
        create,
        update,
        remove,
    }
})
