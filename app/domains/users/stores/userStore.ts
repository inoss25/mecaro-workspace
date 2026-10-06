import { defineStore } from 'pinia'
import {
    CHANGE_USER_PASSWORD,
    CREATE_USER,
    DELETE_USER,
    TOGGLE_USER_STATUS,
    UPDATE_USER,
    UPLOAD_USER_IMAGE,
} from '../graphql/mutations'
import { USER, USER_PAGINATE, USERS } from '../graphql/queries'
import type {
    ChangeUserPasswordMutationResult,
    ChangeUserPasswordMutationVariables,
    CreateUserMutationResult,
    CreateUserMutationVariables,
    DeleteUserMutationResult,
    DeleteUserMutationVariables,
    Gender,
    PaginatorInfo,
    ToggleUserStatusMutationResult,
    ToggleUserStatusMutationVariables,
    UpdateUserMutationResult,
    UpdateUserMutationVariables,
    UploadUserImageMutationResult,
    UploadUserImageMutationVariables,
    User,
    UserCreateInput,
    UserFilterInput,
    UserOrderInput,
    UserPaginateQueryResult,
    UserPaginateQueryVariables,
    UserQueryResult,
    UserQueryVariables,
    UsersQueryResult,
    UsersQueryVariables,
    UserStatus,
    UserUpdateInput,
} from '../types'
import { orderByFromKey, type UserOrderKey } from '../utils/options'

export const useUserStore = defineStore('user', () => {
    const items = ref<User[]>([])
    const paginatorInfo = ref<PaginatorInfo | null>(null)
    const page = ref(1)
    const perPage = ref(10)
    const search = ref('')
    const gender = ref<Gender | ''>('')
    const status = ref<UserStatus | ''>('')
    const orderKey = ref<UserOrderKey>('created_desc')
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

    function buildVariables(): UserPaginateQueryVariables {
        const filter: UserFilterInput = {}
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
            const response = await client.query<UserPaginateQueryResult, UserPaginateQueryVariables>({
                query: USER_PAGINATE,
                variables,
                fetchPolicy: 'network-only',
            })
            if (current !== requestId) return

            items.value = response.data?.userPaginate.data ?? []
            paginatorInfo.value = response.data?.userPaginate.paginatorInfo ?? null
        }
        catch (cause) {
            if (current !== requestId) return
            error.value = cause
        }
        finally {
            if (current === requestId) loading.value = false
        }
    }

    async function fetchAll(filter?: UserFilterInput | null, orderBy?: UserOrderInput | null) {
        const response = await client.query<UsersQueryResult, UsersQueryVariables>({
            query: USERS,
            variables: {
                filter: filter ?? undefined,
                order_by: orderBy ?? { column: 'CREATED_AT', order: 'DESC' },
            },
            fetchPolicy: 'network-only',
        })

        return response.data?.users ?? []
    }

    async function find(id: string) {
        try {
            const response = await client.query<UserQueryResult, UserQueryVariables>({
                query: USER,
                variables: { id },
                fetchPolicy: 'network-only',
            })
            return response.data?.user ?? null
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

    function applyStatus(value: UserStatus | '') {
        if (status.value === value && page.value === 1) return
        status.value = value
        page.value = 1
        return fetchPage()
    }

    function applyOrder(value: UserOrderKey) {
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

    function create(input: UserCreateInput, image?: File | null) {
        return runMutation(async () => {
            const apollo = image ? uploadClient : client
            if (!apollo) {
                mutationError.value = new Error('L’envoi de la photo est disponible dans le navigateur.')
                return null
            }

            const { data } = await apollo.mutate<CreateUserMutationResult, CreateUserMutationVariables>({
                mutation: CREATE_USER,
                variables: {
                    input: image ? { ...input, image } : input,
                },
            })

            const created = data?.createUser
            if (!created) {
                mutationError.value = new Error('La création n’a pas renvoyé d’utilisateur.')
                return null
            }

            page.value = 1
            await fetchPage()
            return created
        })
    }

    function update(id: string, input: UserUpdateInput, image?: File | null) {
        return runMutation(async () => {
            const apollo = image ? uploadClient : client
            if (!apollo) {
                mutationError.value = new Error('L’envoi de la photo est disponible dans le navigateur.')
                return null
            }

            const { data } = await apollo.mutate<UpdateUserMutationResult, UpdateUserMutationVariables>({
                mutation: UPDATE_USER,
                variables: {
                    id,
                    input: image ? { ...input, image } : input,
                },
            })

            const updated = data?.updateUser
            if (!updated) {
                mutationError.value = new Error('La modification n’a pas renvoyé d’utilisateur.')
                return null
            }

            await fetchPage()
            return updated
        })
    }

    function remove(id: string) {
        return runMutation(async () => {
            const { data } = await client.mutate<DeleteUserMutationResult, DeleteUserMutationVariables>({
                mutation: DELETE_USER,
                variables: { id },
            })

            const deleted = data?.deleteUser
            if (!deleted) {
                mutationError.value = new Error('La suppression n’a pas renvoyé d’utilisateur.')
                return null
            }

            await fetchPage()
            return deleted
        })
    }

    function toggleStatus(id: string, nextStatus: UserStatus) {
        return runMutation(async () => {
            const { data } = await client.mutate<ToggleUserStatusMutationResult, ToggleUserStatusMutationVariables>({
                mutation: TOGGLE_USER_STATUS,
                variables: { id, status: nextStatus },
            })

            const updated = data?.toggleUserStatus
            if (!updated) {
                mutationError.value = new Error('Le changement de statut n’a pas renvoyé d’utilisateur.')
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

            const { data } = await uploadClient.mutate<UploadUserImageMutationResult, UploadUserImageMutationVariables>({
                mutation: UPLOAD_USER_IMAGE,
                variables: { id, image },
            })

            const updated = data?.uploadUserImage
            if (!updated) {
                mutationError.value = new Error('L’envoi de la photo n’a pas renvoyé d’utilisateur.')
                return null
            }

            await fetchPage()
            return updated
        })
    }

    function changePassword(variables: ChangeUserPasswordMutationVariables) {
        return runMutation(async () => {
            const { data } = await client.mutate<ChangeUserPasswordMutationResult, ChangeUserPasswordMutationVariables>({
                mutation: CHANGE_USER_PASSWORD,
                variables,
            })

            const updated = data?.changeUserPassword
            if (!updated) {
                mutationError.value = new Error('Le changement de mot de passe n’a pas renvoyé d’utilisateur.')
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
