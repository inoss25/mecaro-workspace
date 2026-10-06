import { defineStore } from 'pinia'
import {
    CHANGE_ADMINISTRATOR_PASSWORD,
    CREATE_ADMINISTRATOR,
    DELETE_ADMINISTRATOR,
    TOGGLE_ADMINISTRATOR_STATUS,
    UPDATE_ADMINISTRATOR,
    UPLOAD_ADMINISTRATOR_IMAGE,
} from '../graphql/mutations'
import { ADMINISTRATOR, ADMINISTRATOR_PAGINATE, ADMINISTRATORS } from '../graphql/queries'
import type {
    Administrator,
    AdministratorCreateInput,
    AdministratorFilterInput,
    AdministratorOrderInput,
    AdministratorPaginateQueryResult,
    AdministratorPaginateQueryVariables,
    AdministratorQueryResult,
    AdministratorQueryVariables,
    AdministratorsQueryResult,
    AdministratorsQueryVariables,
    AdministratorStatus,
    AdministratorUpdateInput,
    ChangeAdministratorPasswordMutationResult,
    ChangeAdministratorPasswordMutationVariables,
    CreateAdministratorMutationResult,
    CreateAdministratorMutationVariables,
    DeleteAdministratorMutationResult,
    DeleteAdministratorMutationVariables,
    Gender,
    PaginatorInfo,
    ToggleAdministratorStatusMutationResult,
    ToggleAdministratorStatusMutationVariables,
    UpdateAdministratorMutationResult,
    UpdateAdministratorMutationVariables,
    UploadAdministratorImageMutationResult,
    UploadAdministratorImageMutationVariables,
} from '../types'
import { orderByFromKey, type AdministratorOrderKey } from '../utils/options'

export const useAdministratorStore = defineStore('administrator', () => {
    const items = ref<Administrator[]>([])
    const paginatorInfo = ref<PaginatorInfo | null>(null)
    const page = ref(1)
    const perPage = ref(10)
    const search = ref('')
    const gender = ref<Gender | ''>('')
    const status = ref<AdministratorStatus | ''>('')
    const orderKey = ref<AdministratorOrderKey>('created_desc')
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

    function buildVariables(): AdministratorPaginateQueryVariables {
        const filter: AdministratorFilterInput = {}
        const term = search.value.trim()
        if (term) filter.search = term
        if (gender.value) filter.gender = gender.value
        if (status.value) filter.status = status.value

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
            const response = await client.query<AdministratorPaginateQueryResult, AdministratorPaginateQueryVariables>({
                query: ADMINISTRATOR_PAGINATE,
                variables,
                fetchPolicy: 'network-only',
            })
            if (current !== requestId) return

            items.value = response.data?.administratorPaginate.data ?? []
            paginatorInfo.value = response.data?.administratorPaginate.paginatorInfo ?? null
        }
        catch (cause) {
            if (current !== requestId) return
            error.value = cause
        }
        finally {
            if (current === requestId) loading.value = false
        }
    }

    async function fetchAll(filter?: AdministratorFilterInput | null, orderBy?: AdministratorOrderInput | null) {
        const response = await client.query<AdministratorsQueryResult, AdministratorsQueryVariables>({
            query: ADMINISTRATORS,
            variables: {
                filter: filter ?? undefined,
                order_by: orderBy ?? { column: 'CREATED_AT', order: 'DESC' },
            },
            fetchPolicy: 'network-only',
        })

        return response.data?.administrators ?? []
    }

    async function find(id: string) {
        try {
            const response = await client.query<AdministratorQueryResult, AdministratorQueryVariables>({
                query: ADMINISTRATOR,
                variables: { id },
                fetchPolicy: 'network-only',
            })
            return response.data?.administrator ?? null
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

    function applyGender(value: Gender | '') {
        if (gender.value === value && page.value === 1) return
        gender.value = value
        page.value = 1
        return fetchPage()
    }

    function applyStatus(value: AdministratorStatus | '') {
        if (status.value === value && page.value === 1) return
        status.value = value
        page.value = 1
        return fetchPage()
    }

    function applyOrder(value: AdministratorOrderKey) {
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

    function create(input: AdministratorCreateInput, image?: File | null) {
        return runMutation(async () => {
            const apollo = image ? uploadClient : client
            if (!apollo) {
                mutationError.value = new Error('L’envoi de la photo est disponible dans le navigateur.')
                return null
            }

            const { data } = await apollo.mutate<CreateAdministratorMutationResult, CreateAdministratorMutationVariables>({
                mutation: CREATE_ADMINISTRATOR,
                variables: {
                    input: image ? { ...input, image } : input,
                },
            })

            const created = data?.createAdministrator
            if (!created) {
                mutationError.value = new Error('La création n’a pas renvoyé d’administrateur.')
                return null
            }

            page.value = 1
            await fetchPage()
            return created
        })
    }

    function update(id: string, input: AdministratorUpdateInput, image?: File | null) {
        return runMutation(async () => {
            const apollo = image ? uploadClient : client
            if (!apollo) {
                mutationError.value = new Error('L’envoi de la photo est disponible dans le navigateur.')
                return null
            }

            const { data } = await apollo.mutate<UpdateAdministratorMutationResult, UpdateAdministratorMutationVariables>({
                mutation: UPDATE_ADMINISTRATOR,
                variables: {
                    id,
                    input: image ? { ...input, image } : input,
                },
            })

            const updated = data?.updateAdministrator
            if (!updated) {
                mutationError.value = new Error('La modification n’a pas renvoyé d’administrateur.')
                return null
            }

            await fetchPage()
            return updated
        })
    }

    function remove(id: string) {
        return runMutation(async () => {
            const { data } = await client.mutate<DeleteAdministratorMutationResult, DeleteAdministratorMutationVariables>({
                mutation: DELETE_ADMINISTRATOR,
                variables: { id },
            })

            const deleted = data?.deleteAdministrator
            if (!deleted) {
                mutationError.value = new Error('La suppression n’a pas renvoyé d’administrateur.')
                return null
            }

            await fetchPage()
            return deleted
        })
    }

    function toggleStatus(id: string, nextStatus: AdministratorStatus) {
        return runMutation(async () => {
            const { data } = await client.mutate<ToggleAdministratorStatusMutationResult, ToggleAdministratorStatusMutationVariables>({
                mutation: TOGGLE_ADMINISTRATOR_STATUS,
                variables: { id, status: nextStatus },
            })

            const updated = data?.toggleAdministratorStatus
            if (!updated) {
                mutationError.value = new Error('Le changement de statut n’a pas renvoyé d’administrateur.')
                return null
            }

            await fetchPage()
            return updated
        })
    }

    function uploadImage(id: string, image: File) {
        return runMutation(async () => {
            if (!uploadClient) {
                mutationError.value = new Error('L’envoi de la photo est disponible dans le navigateur.')
                return null
            }

            const { data } = await uploadClient.mutate<UploadAdministratorImageMutationResult, UploadAdministratorImageMutationVariables>({
                mutation: UPLOAD_ADMINISTRATOR_IMAGE,
                variables: { id, image },
            })

            const updated = data?.uploadAdministratorImage
            if (!updated) {
                mutationError.value = new Error('L’envoi de la photo n’a pas renvoyé d’administrateur.')
                return null
            }

            await fetchPage()
            return updated
        })
    }

    function changePassword(variables: ChangeAdministratorPasswordMutationVariables) {
        return runMutation(async () => {
            const { data } = await client.mutate<ChangeAdministratorPasswordMutationResult, ChangeAdministratorPasswordMutationVariables>({
                mutation: CHANGE_ADMINISTRATOR_PASSWORD,
                variables,
            })

            const updated = data?.changeAdministratorPassword
            if (!updated) {
                mutationError.value = new Error('Le changement de mot de passe n’a pas renvoyé d’administrateur.')
                return null
            }

            await fetchPage()
            return updated
        })
    }

    return {
        items,
        paginatorInfo,
        page,
        perPage,
        search,
        gender,
        status,
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
        applyGender,
        applyStatus,
        applyOrder,
        setPage,
        setPerPage,
        create,
        update,
        remove,
        toggleStatus,
        uploadImage,
        changePassword,
    }
})
