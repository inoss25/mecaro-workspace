import { defineStore } from 'pinia'
import { CREATE_VEHICLE_BRAND, DELETE_VEHICLE_BRAND, UPDATE_VEHICLE_BRAND } from '../graphql/mutations'
import { VEHICLE_BRAND, VEHICLE_BRAND_PAGINATE, VEHICLE_BRANDS } from '../graphql/queries'
import type {
    CreateVehicleBrandMutationResult,
    CreateVehicleBrandMutationVariables,
    DeleteVehicleBrandMutationResult,
    DeleteVehicleBrandMutationVariables,
    PaginatorInfo,
    UpdateVehicleBrandMutationResult,
    UpdateVehicleBrandMutationVariables,
    VehicleBrand,
    VehicleBrandCreateInput,
    VehicleBrandFilterInput,
    VehicleBrandOrderInput,
    VehicleBrandPaginateQueryResult,
    VehicleBrandPaginateQueryVariables,
    VehicleBrandQueryResult,
    VehicleBrandQueryVariables,
    VehicleBrandUpdateInput,
    VehicleBrandsQueryResult,
    VehicleBrandsQueryVariables,
} from '../types'
import { orderByFromKey, type VehicleBrandOrderKey } from '../utils/options'

export const useVehicleBrandStore = defineStore('vehicleBrand', () => {
    const items = ref<VehicleBrand[]>([])
    const paginatorInfo = ref<PaginatorInfo | null>(null)
    const page = ref(1)
    const perPage = ref(10)
    const search = ref('')
    const isActive = ref<'' | 'true' | 'false'>('')
    const orderKey = ref<VehicleBrandOrderKey>('created_desc')
    const loading = ref(false)
    const saving = ref(false)
    const error = ref<unknown>(null)
    const mutationError = ref<unknown>(null)

    const client = useApolloClient()
    const uploadClient = import.meta.client ? useApolloUploadClient() : null
    const total = computed(() => paginatorInfo.value?.total ?? 0)

    let requestId = 0

    function clearMutationError() {
        mutationError.value = null
    }

    function buildVariables(): VehicleBrandPaginateQueryVariables {
        const filter: VehicleBrandFilterInput = {}
        const term = search.value.trim()
        if (term) filter.search = term
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
            const response = await client.query<VehicleBrandPaginateQueryResult, VehicleBrandPaginateQueryVariables>({
                query: VEHICLE_BRAND_PAGINATE,
                variables,
                fetchPolicy: 'network-only',
            })
            if (current !== requestId) return

            items.value = response.data?.vehicleBrandPaginate.data ?? []
            paginatorInfo.value = response.data?.vehicleBrandPaginate.paginatorInfo ?? null
        }
        catch (cause) {
            if (current !== requestId) return
            error.value = cause
        }
        finally {
            if (current === requestId) loading.value = false
        }
    }

    async function fetchAll(filter?: VehicleBrandFilterInput | null, orderBy?: VehicleBrandOrderInput | null) {
        const response = await client.query<VehicleBrandsQueryResult, VehicleBrandsQueryVariables>({
            query: VEHICLE_BRANDS,
            variables: {
                filter: filter ?? undefined,
                order_by: orderBy ?? { column: 'NAME', order: 'ASC' },
            },
            fetchPolicy: 'network-only',
        })

        return response.data?.vehicleBrands ?? []
    }

    async function find(id: string) {
        try {
            const response = await client.query<VehicleBrandQueryResult, VehicleBrandQueryVariables>({
                query: VEHICLE_BRAND,
                variables: { id },
                fetchPolicy: 'network-only',
            })
            return response.data?.vehicleBrand ?? null
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

    function applyIsActive(value: '' | 'true' | 'false') {
        if (isActive.value === value && page.value === 1) return
        isActive.value = value
        page.value = 1
        return fetchPage()
    }

    function applyOrder(value: VehicleBrandOrderKey) {
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

    function create(input: VehicleBrandCreateInput, logo?: File | null) {
        return runMutation(async () => {
            const apollo = logo ? uploadClient : client
            if (!apollo) {
                mutationError.value = new Error('L’envoi du logo est disponible dans le navigateur.')
                return null
            }

            const { data } = await apollo.mutate<CreateVehicleBrandMutationResult, CreateVehicleBrandMutationVariables>({
                mutation: CREATE_VEHICLE_BRAND,
                variables: {
                    input: logo ? { ...input, logo } : input,
                },
            })

            const created = data?.createVehicleBrand
            if (!created) {
                mutationError.value = new Error('La création n’a pas renvoyé de marque.')
                return null
            }

            page.value = 1
            await fetchPage()
            return created
        })
    }

    function update(id: string, input: VehicleBrandUpdateInput, logo?: File | null) {
        return runMutation(async () => {
            const apollo = logo ? uploadClient : client
            if (!apollo) {
                mutationError.value = new Error('L’envoi du logo est disponible dans le navigateur.')
                return null
            }

            const { data } = await apollo.mutate<UpdateVehicleBrandMutationResult, UpdateVehicleBrandMutationVariables>({
                mutation: UPDATE_VEHICLE_BRAND,
                variables: {
                    id,
                    input: logo ? { ...input, logo } : input,
                },
            })

            const updated = data?.updateVehicleBrand
            if (!updated) {
                mutationError.value = new Error('La modification n’a pas renvoyé de marque.')
                return null
            }

            await fetchPage()
            return updated
        })
    }

    function remove(id: string) {
        return runMutation(async () => {
            const { data } = await client.mutate<DeleteVehicleBrandMutationResult, DeleteVehicleBrandMutationVariables>({
                mutation: DELETE_VEHICLE_BRAND,
                variables: { id },
            })

            if (!data?.deleteVehicleBrand) {
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
        isActive,
        orderKey,
        loading,
        saving,
        error,
        mutationError,
        total,
        clearMutationError,
        fetchPage,
        fetchAll,
        find,
        applySearch,
        applyIsActive,
        applyOrder,
        setPage,
        setPerPage,
        create,
        update,
        remove,
    }
})
