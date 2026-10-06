import { defineStore } from 'pinia'
import { MAINTENANCE_RECORDS } from '../../maintenance-records/graphql/queries'
import type {
    MaintenanceRecord,
    MaintenanceRecordsQueryResult,
    MaintenanceRecordsQueryVariables,
} from '../../maintenance-records/types'
import { CREATE_MAINTENANCE_OIL, DELETE_MAINTENANCE_OIL, UPDATE_MAINTENANCE_OIL } from '../graphql/mutations'
import { MAINTENANCE_OIL, MAINTENANCE_OIL_PAGINATE } from '../graphql/queries'
import type {
    CreateMaintenanceOilMutationResult,
    CreateMaintenanceOilMutationVariables,
    DeleteMaintenanceOilMutationResult,
    DeleteMaintenanceOilMutationVariables,
    MaintenanceOil,
    MaintenanceOilCreateInput,
    MaintenanceOilFilterInput,
    MaintenanceOilPaginateQueryResult,
    MaintenanceOilPaginateQueryVariables,
    MaintenanceOilQueryResult,
    MaintenanceOilQueryVariables,
    MaintenanceOilUpdateInput,
    PaginatorInfo,
    UpdateMaintenanceOilMutationResult,
    UpdateMaintenanceOilMutationVariables,
} from '../types'
import { orderByFromKey, type MaintenanceOilOrderKey } from '../utils/options'

export const useMaintenanceOilStore = defineStore('maintenanceOil', () => {
    const items = ref<MaintenanceOil[]>([])
    const paginatorInfo = ref<PaginatorInfo | null>(null)
    const records = ref<MaintenanceRecord[]>([])
    const page = ref(1)
    const perPage = ref(10)
    const search = ref('')
    const recordId = ref('')
    const fixedRecordId = ref<string | null>(null)
    const orderKey = ref<MaintenanceOilOrderKey>('created_desc')
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

    function buildVariables(): MaintenanceOilPaginateQueryVariables {
        const filter: MaintenanceOilFilterInput = {}
        const term = search.value.trim()
        if (term) filter.search = term
        const activeRecordId = fixedRecordId.value || recordId.value
        if (activeRecordId) filter.maintenance_record_id = activeRecordId

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
            const response = await client.query<MaintenanceOilPaginateQueryResult, MaintenanceOilPaginateQueryVariables>({
                query: MAINTENANCE_OIL_PAGINATE,
                variables: buildVariables(),
                fetchPolicy: 'network-only',
            })
            if (current !== requestId) return
            items.value = response.data?.maintenanceOilPaginate.data ?? []
            paginatorInfo.value = response.data?.maintenanceOilPaginate.paginatorInfo ?? null
        }
        catch (cause) {
            if (current !== requestId) return
            error.value = cause
        }
        finally {
            if (current === requestId) loading.value = false
        }
    }

    async function fetchRecords() {
        optionsLoading.value = true
        optionsError.value = null
        try {
            const response = await client.query<MaintenanceRecordsQueryResult, MaintenanceRecordsQueryVariables>({
                query: MAINTENANCE_RECORDS,
                variables: { order_by: { column: 'MAINTENANCE_DATE', order: 'DESC' } },
                fetchPolicy: 'network-only',
            })
            records.value = response.data?.maintenanceRecords ?? []
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
            const response = await client.query<MaintenanceOilQueryResult, MaintenanceOilQueryVariables>({
                query: MAINTENANCE_OIL,
                variables: { id },
                fetchPolicy: 'network-only',
            })
            return response.data?.maintenanceOil ?? null
        }
        catch {
            return null
        }
    }

    function setFixedRecordId(value: string | null) {
        fixedRecordId.value = value
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

    function applyRecord(value: string) {
        if (fixedRecordId.value) return
        if (recordId.value === value && page.value === 1) return
        recordId.value = value
        page.value = 1
        return fetchPage()
    }

    function applyOrder(value: MaintenanceOilOrderKey) {
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

    function create(input: MaintenanceOilCreateInput) {
        return runMutation(async () => {
            const { data } = await client.mutate<CreateMaintenanceOilMutationResult, CreateMaintenanceOilMutationVariables>({
                mutation: CREATE_MAINTENANCE_OIL,
                variables: { input },
            })
            const created = data?.createMaintenanceOil
            if (!created) {
                mutationError.value = new Error('La création n’a pas renvoyé d’huile.')
                return null
            }
            page.value = 1
            await fetchPage()
            return created
        })
    }

    function update(id: string, input: MaintenanceOilUpdateInput) {
        return runMutation(async () => {
            const { data } = await client.mutate<UpdateMaintenanceOilMutationResult, UpdateMaintenanceOilMutationVariables>({
                mutation: UPDATE_MAINTENANCE_OIL,
                variables: { id, input },
            })
            const updated = data?.updateMaintenanceOil
            if (!updated) {
                mutationError.value = new Error('La modification n’a pas renvoyé d’huile.')
                return null
            }
            await fetchPage()
            return updated
        })
    }

    function remove(id: string) {
        return runMutation(async () => {
            const { data } = await client.mutate<DeleteMaintenanceOilMutationResult, DeleteMaintenanceOilMutationVariables>({
                mutation: DELETE_MAINTENANCE_OIL,
                variables: { id },
            })
            if (!data?.deleteMaintenanceOil) {
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
        records,
        page,
        perPage,
        search,
        recordId,
        fixedRecordId,
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
        fetchRecords,
        find,
        setFixedRecordId,
        applySearch,
        applyRecord,
        applyOrder,
        setPage,
        setPerPage,
        create,
        update,
        remove,
    }
})
