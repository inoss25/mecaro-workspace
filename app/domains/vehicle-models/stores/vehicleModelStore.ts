import { defineStore } from 'pinia'
import { VEHICLE_BRANDS } from '../../vehicle-brands/graphql/queries'
import type { VehicleBrand, VehicleBrandsQueryResult, VehicleBrandsQueryVariables } from '../../vehicle-brands/types'
import { CREATE_VEHICLE_MODEL, DELETE_VEHICLE_MODEL, UPDATE_VEHICLE_MODEL } from '../graphql/mutations'
import { VEHICLE_MODEL, VEHICLE_MODEL_PAGINATE, VEHICLE_MODELS } from '../graphql/queries'
import type {
    CreateVehicleModelMutationResult,
    CreateVehicleModelMutationVariables,
    DeleteVehicleModelMutationResult,
    DeleteVehicleModelMutationVariables,
    PaginatorInfo,
    UpdateVehicleModelMutationResult,
    UpdateVehicleModelMutationVariables,
    VehicleModel,
    VehicleModelCreateInput,
    VehicleModelFilterInput,
    VehicleModelOrderInput,
    VehicleModelPaginateQueryResult,
    VehicleModelPaginateQueryVariables,
    VehicleModelQueryResult,
    VehicleModelQueryVariables,
    VehicleModelUpdateInput,
    VehicleModelsQueryResult,
    VehicleModelsQueryVariables,
} from '../types'
import { orderByFromKey, type VehicleModelOrderKey } from '../utils/options'

export const useVehicleModelStore = defineStore('vehicleModel', () => {
    const items = ref<VehicleModel[]>([])
    const paginatorInfo = ref<PaginatorInfo | null>(null)
    const brands = ref<VehicleBrand[]>([])
    const page = ref(1)
    const perPage = ref(10)
    const search = ref('')
    const vehicleBrandId = ref('')
    const isActive = ref<'' | 'true' | 'false'>('')
    const orderKey = ref<VehicleModelOrderKey>('created_desc')
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

    function buildVariables(): VehicleModelPaginateQueryVariables {
        const filter: VehicleModelFilterInput = {}
        const term = search.value.trim()
        if (term) filter.search = term
        if (vehicleBrandId.value) filter.vehicle_brand_id = vehicleBrandId.value
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
        const variables = buildVariables()
        loading.value = true
        error.value = null

        try {
            const response = await client.query<VehicleModelPaginateQueryResult, VehicleModelPaginateQueryVariables>({
                query: VEHICLE_MODEL_PAGINATE,
                variables,
                fetchPolicy: 'network-only',
            })
            if (current !== requestId) return

            items.value = response.data?.vehicleModelPaginate.data ?? []
            paginatorInfo.value = response.data?.vehicleModelPaginate.paginatorInfo ?? null
        }
        catch (cause) {
            if (current !== requestId) return
            error.value = cause
        }
        finally {
            if (current === requestId) loading.value = false
        }
    }

    async function fetchBrands() {
        optionsLoading.value = true
        optionsError.value = null

        try {
            const response = await client.query<VehicleBrandsQueryResult, VehicleBrandsQueryVariables>({
                query: VEHICLE_BRANDS,
                variables: {
                    order_by: { column: 'NAME', order: 'ASC' },
                },
                fetchPolicy: 'network-only',
            })
            brands.value = response.data?.vehicleBrands ?? []
        }
        catch (cause) {
            optionsError.value = cause
        }
        finally {
            optionsLoading.value = false
        }
    }

    async function fetchAll(filter?: VehicleModelFilterInput | null, orderBy?: VehicleModelOrderInput | null) {
        const response = await client.query<VehicleModelsQueryResult, VehicleModelsQueryVariables>({
            query: VEHICLE_MODELS,
            variables: {
                filter: filter ?? undefined,
                order_by: orderBy ?? { column: 'NAME', order: 'ASC' },
            },
            fetchPolicy: 'network-only',
        })

        return response.data?.vehicleModels ?? []
    }

    async function find(id: string) {
        try {
            const response = await client.query<VehicleModelQueryResult, VehicleModelQueryVariables>({
                query: VEHICLE_MODEL,
                variables: { id },
                fetchPolicy: 'network-only',
            })
            return response.data?.vehicleModel ?? null
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

    function applyVehicleBrand(value: string) {
        if (vehicleBrandId.value === value && page.value === 1) return
        vehicleBrandId.value = value
        page.value = 1
        return fetchPage()
    }

    function applyIsActive(value: '' | 'true' | 'false') {
        if (isActive.value === value && page.value === 1) return
        isActive.value = value
        page.value = 1
        return fetchPage()
    }

    function applyOrder(value: VehicleModelOrderKey) {
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

    function create(input: VehicleModelCreateInput) {
        return runMutation(async () => {
            const { data } = await client.mutate<CreateVehicleModelMutationResult, CreateVehicleModelMutationVariables>({
                mutation: CREATE_VEHICLE_MODEL,
                variables: { input },
            })

            const created = data?.createVehicleModel
            if (!created) {
                mutationError.value = new Error('La création n’a pas renvoyé de modèle.')
                return null
            }

            page.value = 1
            await fetchPage()
            return created
        })
    }

    function update(id: string, input: VehicleModelUpdateInput) {
        return runMutation(async () => {
            const { data } = await client.mutate<UpdateVehicleModelMutationResult, UpdateVehicleModelMutationVariables>({
                mutation: UPDATE_VEHICLE_MODEL,
                variables: { id, input },
            })

            const updated = data?.updateVehicleModel
            if (!updated) {
                mutationError.value = new Error('La modification n’a pas renvoyé de modèle.')
                return null
            }

            await fetchPage()
            return updated
        })
    }

    function remove(id: string) {
        return runMutation(async () => {
            const { data } = await client.mutate<DeleteVehicleModelMutationResult, DeleteVehicleModelMutationVariables>({
                mutation: DELETE_VEHICLE_MODEL,
                variables: { id },
            })

            if (!data?.deleteVehicleModel) {
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
        brands,
        page,
        perPage,
        search,
        vehicleBrandId,
        isActive,
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
        fetchBrands,
        fetchAll,
        find,
        applySearch,
        applyVehicleBrand,
        applyIsActive,
        applyOrder,
        setPage,
        setPerPage,
        create,
        update,
        remove,
    }
})
