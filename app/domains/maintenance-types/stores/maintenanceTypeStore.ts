import { defineStore } from 'pinia'
import { MAINTENANCE_CATEGORIES } from '../../maintenance-categories/graphql/queries'
import type {
    MaintenanceCategoriesQueryResult,
    MaintenanceCategoriesQueryVariables,
    MaintenanceCategory,
} from '../../maintenance-categories/types'
import { CREATE_MAINTENANCE_TYPE, DELETE_MAINTENANCE_TYPE, UPDATE_MAINTENANCE_TYPE } from '../graphql/mutations'
import { MAINTENANCE_TYPE, MAINTENANCE_TYPE_PAGINATE, MAINTENANCE_TYPES } from '../graphql/queries'
import type {
    CreateMaintenanceTypeMutationResult,
    CreateMaintenanceTypeMutationVariables,
    DeleteMaintenanceTypeMutationResult,
    DeleteMaintenanceTypeMutationVariables,
    MaintenanceType,
    MaintenanceTypeCreateInput,
    MaintenanceTypeFilterInput,
    MaintenanceTypeOrderInput,
    MaintenanceTypePaginateQueryResult,
    MaintenanceTypePaginateQueryVariables,
    MaintenanceTypeQueryResult,
    MaintenanceTypeQueryVariables,
    MaintenanceTypeUpdateInput,
    MaintenanceTypesQueryResult,
    MaintenanceTypesQueryVariables,
    PaginatorInfo,
    UpdateMaintenanceTypeMutationResult,
    UpdateMaintenanceTypeMutationVariables,
} from '../types'
import { orderByFromKey, type MaintenanceTypeOrderKey } from '../utils/options'

export const useMaintenanceTypeStore = defineStore('maintenanceType', () => {
    const items = ref<MaintenanceType[]>([])
    const paginatorInfo = ref<PaginatorInfo | null>(null)
    const categories = ref<MaintenanceCategory[]>([])
    const page = ref(1)
    const perPage = ref(10)
    const search = ref('')
    const categoryId = ref('')
    const isActive = ref<'' | 'true' | 'false'>('')
    const orderKey = ref<MaintenanceTypeOrderKey>('name_asc')
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

    function buildVariables(): MaintenanceTypePaginateQueryVariables {
        const filter: MaintenanceTypeFilterInput = {}
        const term = search.value.trim()
        if (term) filter.search = term
        if (categoryId.value) filter.maintenance_category_id = categoryId.value
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
            const response = await client.query<MaintenanceTypePaginateQueryResult, MaintenanceTypePaginateQueryVariables>({
                query: MAINTENANCE_TYPE_PAGINATE,
                variables,
                fetchPolicy: 'network-only',
            })
            if (current !== requestId) return

            items.value = response.data?.maintenanceTypePaginate.data ?? []
            paginatorInfo.value = response.data?.maintenanceTypePaginate.paginatorInfo ?? null
        }
        catch (cause) {
            if (current !== requestId) return
            error.value = cause
        }
        finally {
            if (current === requestId) loading.value = false
        }
    }

    async function fetchCategories() {
        optionsLoading.value = true
        optionsError.value = null

        try {
            const response = await client.query<MaintenanceCategoriesQueryResult, MaintenanceCategoriesQueryVariables>({
                query: MAINTENANCE_CATEGORIES,
                variables: {
                    order_by: { column: 'NAME', order: 'ASC' },
                },
                fetchPolicy: 'network-only',
            })
            categories.value = response.data?.maintenanceCategories ?? []
        }
        catch (cause) {
            optionsError.value = cause
        }
        finally {
            optionsLoading.value = false
        }
    }

    async function fetchAll(filter?: MaintenanceTypeFilterInput | null, orderBy?: MaintenanceTypeOrderInput | null) {
        const response = await client.query<MaintenanceTypesQueryResult, MaintenanceTypesQueryVariables>({
            query: MAINTENANCE_TYPES,
            variables: {
                filter: filter ?? undefined,
                order_by: orderBy ?? { column: 'NAME', order: 'ASC' },
            },
            fetchPolicy: 'network-only',
        })

        return response.data?.maintenanceTypes ?? []
    }

    async function find(id: string) {
        try {
            const response = await client.query<MaintenanceTypeQueryResult, MaintenanceTypeQueryVariables>({
                query: MAINTENANCE_TYPE,
                variables: { id },
                fetchPolicy: 'network-only',
            })
            return response.data?.maintenanceType ?? null
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

    function applyCategory(value: string) {
        if (categoryId.value === value && page.value === 1) return
        categoryId.value = value
        page.value = 1
        return fetchPage()
    }

    function applyIsActive(value: '' | 'true' | 'false') {
        if (isActive.value === value && page.value === 1) return
        isActive.value = value
        page.value = 1
        return fetchPage()
    }

    function applyOrder(value: MaintenanceTypeOrderKey) {
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

    function create(input: MaintenanceTypeCreateInput) {
        return runMutation(async () => {
            const { data } = await client.mutate<CreateMaintenanceTypeMutationResult, CreateMaintenanceTypeMutationVariables>({
                mutation: CREATE_MAINTENANCE_TYPE,
                variables: { input },
            })

            const created = data?.createMaintenanceType
            if (!created) {
                mutationError.value = new Error('La création n’a pas renvoyé de type.')
                return null
            }

            page.value = 1
            await fetchPage()
            return created
        })
    }

    function update(id: string, input: MaintenanceTypeUpdateInput) {
        return runMutation(async () => {
            const { data } = await client.mutate<UpdateMaintenanceTypeMutationResult, UpdateMaintenanceTypeMutationVariables>({
                mutation: UPDATE_MAINTENANCE_TYPE,
                variables: { id, input },
            })

            const updated = data?.updateMaintenanceType
            if (!updated) {
                mutationError.value = new Error('La modification n’a pas renvoyé de type.')
                return null
            }

            await fetchPage()
            return updated
        })
    }

    function remove(id: string) {
        return runMutation(async () => {
            const { data } = await client.mutate<DeleteMaintenanceTypeMutationResult, DeleteMaintenanceTypeMutationVariables>({
                mutation: DELETE_MAINTENANCE_TYPE,
                variables: { id },
            })

            if (!data?.deleteMaintenanceType) {
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
        categories,
        page,
        perPage,
        search,
        categoryId,
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
        fetchCategories,
        fetchAll,
        find,
        applySearch,
        applyCategory,
        applyIsActive,
        applyOrder,
        setPage,
        setPerPage,
        create,
        update,
        remove,
    }
})
