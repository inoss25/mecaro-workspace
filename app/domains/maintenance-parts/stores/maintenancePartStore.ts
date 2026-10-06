import { defineStore } from 'pinia'
import { MAINTENANCE_RECORDS } from '../../maintenance-records/graphql/queries'
import type { MaintenanceRecord, MaintenanceRecordsQueryResult, MaintenanceRecordsQueryVariables } from '../../maintenance-records/types'
import { CREATE_MAINTENANCE_PART, DELETE_MAINTENANCE_PART, UPDATE_MAINTENANCE_PART } from '../graphql/mutations'
import { MAINTENANCE_PART, MAINTENANCE_PART_PAGINATE } from '../graphql/queries'
import type {
    CreateMaintenancePartMutationResult,
    CreateMaintenancePartMutationVariables,
    DeleteMaintenancePartMutationResult,
    DeleteMaintenancePartMutationVariables,
    MaintenancePart,
    MaintenancePartCreateInput,
    MaintenancePartFilterInput,
    MaintenancePartPaginateQueryResult,
    MaintenancePartPaginateQueryVariables,
    MaintenancePartQueryResult,
    MaintenancePartQueryVariables,
    MaintenancePartUpdateInput,
    PaginatorInfo,
    UpdateMaintenancePartMutationResult,
    UpdateMaintenancePartMutationVariables,
} from '../types'
import { orderByFromKey, type MaintenancePartOrderKey } from '../utils/options'

export const useMaintenancePartStore = defineStore('maintenancePart', () => {
    const items = ref<MaintenancePart[]>([])
    const paginatorInfo = ref<PaginatorInfo | null>(null)
    const records = ref<MaintenanceRecord[]>([])
    const page = ref(1)
    const perPage = ref(10)
    const search = ref('')
    const recordId = ref('')
    const fixedRecordId = ref<string | null>(null)
    const orderKey = ref<MaintenancePartOrderKey>('name_asc')
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

    function buildVariables(): MaintenancePartPaginateQueryVariables {
        const filter: MaintenancePartFilterInput = {}
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
            const response = await client.query<MaintenancePartPaginateQueryResult, MaintenancePartPaginateQueryVariables>({
                query: MAINTENANCE_PART_PAGINATE,
                variables: buildVariables(),
                fetchPolicy: 'network-only',
            })
            if (current !== requestId) return
            items.value = response.data?.maintenancePartPaginate.data ?? []
            paginatorInfo.value = response.data?.maintenancePartPaginate.paginatorInfo ?? null
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
        try {
            const response = await client.query<MaintenanceRecordsQueryResult, MaintenanceRecordsQueryVariables>({
                query: MAINTENANCE_RECORDS,
                variables: { order_by: { column: 'MAINTENANCE_DATE', order: 'DESC' } },
                fetchPolicy: 'network-only',
            })
            records.value = response.data?.maintenanceRecords ?? []
        }
        catch {
            records.value = []
        }
        finally {
            optionsLoading.value = false
        }
    }

    async function find(id: string) {
        try {
            const response = await client.query<MaintenancePartQueryResult, MaintenancePartQueryVariables>({
                query: MAINTENANCE_PART,
                variables: { id },
                fetchPolicy: 'network-only',
            })
            return response.data?.maintenancePart ?? null
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

    function applyRecord(value: string) {
        if (fixedRecordId.value) return
        if (recordId.value === value && page.value === 1) return
        recordId.value = value
        page.value = 1
        return fetchPage()
    }

    function applyOrder(value: MaintenancePartOrderKey) {
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

    function create(input: MaintenancePartCreateInput) {
        return runMutation(async () => {
            const { data } = await client.mutate<CreateMaintenancePartMutationResult, CreateMaintenancePartMutationVariables>({
                mutation: CREATE_MAINTENANCE_PART,
                variables: { input },
            })
            const created = data?.createMaintenancePart
            if (!created) {
                mutationError.value = new Error('La création n’a pas renvoyé de pièce.')
                return null
            }
            page.value = 1
            await fetchPage()
            return created
        })
    }

    function update(id: string, input: MaintenancePartUpdateInput) {
        return runMutation(async () => {
            const { data } = await client.mutate<UpdateMaintenancePartMutationResult, UpdateMaintenancePartMutationVariables>({
                mutation: UPDATE_MAINTENANCE_PART,
                variables: { id, input },
            })
            const updated = data?.updateMaintenancePart
            if (!updated) {
                mutationError.value = new Error('La modification n’a pas renvoyé de pièce.')
                return null
            }
            await fetchPage()
            return updated
        })
    }

    function remove(id: string) {
        return runMutation(async () => {
            const { data } = await client.mutate<DeleteMaintenancePartMutationResult, DeleteMaintenancePartMutationVariables>({
                mutation: DELETE_MAINTENANCE_PART,
                variables: { id },
            })
            if (!data?.deleteMaintenancePart) {
                mutationError.value = new Error('La suppression a échoué.')
                return null
            }
            await fetchPage()
            return true
        })
    }

    return {
        items, paginatorInfo, records, page, perPage, search, recordId, fixedRecordId, orderKey,
        loading, optionsLoading, saving, error, mutationError, total,
        clearMutationError, fetchPage, fetchRecords, find, applySearch, applyRecord, applyOrder, setPage, setPerPage, create, update, remove,
    }
})
