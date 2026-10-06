import { defineStore } from 'pinia'
import { CREATE_MAINTENANCE_CATEGORY, DELETE_MAINTENANCE_CATEGORY, UPDATE_MAINTENANCE_CATEGORY } from '../graphql/mutations'
import { MAINTENANCE_CATEGORIES, MAINTENANCE_CATEGORY, MAINTENANCE_CATEGORY_PAGINATE } from '../graphql/queries'
import type {
    CreateMaintenanceCategoryMutationResult,
    CreateMaintenanceCategoryMutationVariables,
    DeleteMaintenanceCategoryMutationResult,
    DeleteMaintenanceCategoryMutationVariables,
    MaintenanceCategoriesQueryResult,
    MaintenanceCategoriesQueryVariables,
    MaintenanceCategory,
    MaintenanceCategoryCreateInput,
    MaintenanceCategoryFilterInput,
    MaintenanceCategoryOrderInput,
    MaintenanceCategoryPaginateQueryResult,
    MaintenanceCategoryPaginateQueryVariables,
    MaintenanceCategoryQueryResult,
    MaintenanceCategoryQueryVariables,
    MaintenanceCategoryUpdateInput,
    PaginatorInfo,
    UpdateMaintenanceCategoryMutationResult,
    UpdateMaintenanceCategoryMutationVariables,
} from '../types'
import { orderByFromKey, type MaintenanceCategoryOrderKey } from '../utils/options'

export const useMaintenanceCategoryStore = defineStore('maintenanceCategory', () => {
    const items = ref<MaintenanceCategory[]>([])
    const paginatorInfo = ref<PaginatorInfo | null>(null)
    const page = ref(1)
    const perPage = ref(10)
    const search = ref('')
    const isActive = ref<'' | 'true' | 'false'>('')
    const orderKey = ref<MaintenanceCategoryOrderKey>('name_asc')
    const loading = ref(false)
    const saving = ref(false)
    const error = ref<unknown>(null)
    const mutationError = ref<unknown>(null)

    const client = useApolloClient()
    const total = computed(() => paginatorInfo.value?.total ?? 0)

    let requestId = 0

    function clearMutationError() {
        mutationError.value = null
    }

    function buildVariables(): MaintenanceCategoryPaginateQueryVariables {
        const filter: MaintenanceCategoryFilterInput = {}
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
            const response = await client.query<MaintenanceCategoryPaginateQueryResult, MaintenanceCategoryPaginateQueryVariables>({
                query: MAINTENANCE_CATEGORY_PAGINATE,
                variables,
                fetchPolicy: 'network-only',
            })
            if (current !== requestId) return

            items.value = response.data?.maintenanceCategoryPaginate.data ?? []
            paginatorInfo.value = response.data?.maintenanceCategoryPaginate.paginatorInfo ?? null
        }
        catch (cause) {
            if (current !== requestId) return
            error.value = cause
        }
        finally {
            if (current === requestId) loading.value = false
        }
    }

    async function fetchAll(filter?: MaintenanceCategoryFilterInput | null, orderBy?: MaintenanceCategoryOrderInput | null) {
        const response = await client.query<MaintenanceCategoriesQueryResult, MaintenanceCategoriesQueryVariables>({
            query: MAINTENANCE_CATEGORIES,
            variables: {
                filter: filter ?? undefined,
                order_by: orderBy ?? { column: 'NAME', order: 'ASC' },
            },
            fetchPolicy: 'network-only',
        })

        return response.data?.maintenanceCategories ?? []
    }

    async function find(id: string) {
        try {
            const response = await client.query<MaintenanceCategoryQueryResult, MaintenanceCategoryQueryVariables>({
                query: MAINTENANCE_CATEGORY,
                variables: { id },
                fetchPolicy: 'network-only',
            })
            return response.data?.maintenanceCategory ?? null
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

    function applyOrder(value: MaintenanceCategoryOrderKey) {
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

    function create(input: MaintenanceCategoryCreateInput) {
        return runMutation(async () => {
            const { data } = await client.mutate<CreateMaintenanceCategoryMutationResult, CreateMaintenanceCategoryMutationVariables>({
                mutation: CREATE_MAINTENANCE_CATEGORY,
                variables: { input },
            })

            const created = data?.createMaintenanceCategory
            if (!created) {
                mutationError.value = new Error('La création n’a pas renvoyé de catégorie.')
                return null
            }

            page.value = 1
            await fetchPage()
            return created
        })
    }

    function update(id: string, input: MaintenanceCategoryUpdateInput) {
        return runMutation(async () => {
            const { data } = await client.mutate<UpdateMaintenanceCategoryMutationResult, UpdateMaintenanceCategoryMutationVariables>({
                mutation: UPDATE_MAINTENANCE_CATEGORY,
                variables: { id, input },
            })

            const updated = data?.updateMaintenanceCategory
            if (!updated) {
                mutationError.value = new Error('La modification n’a pas renvoyé de catégorie.')
                return null
            }

            await fetchPage()
            return updated
        })
    }

    function remove(id: string) {
        return runMutation(async () => {
            const { data } = await client.mutate<DeleteMaintenanceCategoryMutationResult, DeleteMaintenanceCategoryMutationVariables>({
                mutation: DELETE_MAINTENANCE_CATEGORY,
                variables: { id },
            })

            if (!data?.deleteMaintenanceCategory) {
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
