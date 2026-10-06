export type Gender = 'MALE' | 'FEMALE'

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED'

export type SortOrder = 'ASC' | 'DESC'

export type UserOrderByColumn = 'FIRST_NAME' | 'LAST_NAME' | 'CREATED_AT' | 'UPDATED_AT'

export interface User {
    id: string
    first_name: string
    last_name: string
    name: string
    initial_name: string
    email: string | null
    phone_number: string | null
    gender: Gender | null
    birth_date: string | null
    email_verified_at: string | null
    phone_number_verified_at: string | null
    image_url: string | null
    status: UserStatus | null
    created_at: string
    updated_at: string
}

export interface PaginatorInfo {
    count: number
    currentPage: number
    firstItem: number | null
    hasMorePages: boolean
    lastItem: number | null
    lastPage: number
    perPage: number
    total: number
}

export interface UserPaginator {
    data: User[]
    paginatorInfo: PaginatorInfo
}

export interface UserCreateInput {
    first_name: string
    last_name: string
    email?: string | null
    password?: string | null
    phone_number?: string | null
    image?: File | null
    gender?: Gender | null
    status?: UserStatus | null
}

export interface UserUpdateInput {
    first_name?: string | null
    last_name?: string | null
    email?: string | null
    phone_number?: string | null
    image?: File | null
    gender?: Gender | null
    birth_date?: string | null
    status?: UserStatus | null
}

export interface UserFilterInput {
    search?: string | null
    gender?: Gender | null
    status?: UserStatus | null
}

export interface UserOrderInput {
    column: UserOrderByColumn
    order: SortOrder
}

export interface UserPaginatorInput {
    order_by?: UserOrderInput | null
    filter?: UserFilterInput | null
    first?: number | null
    page?: number | null
}

export interface UserPaginateQueryVariables {
    input?: UserPaginatorInput | null
}

export interface UserPaginateQueryResult {
    userPaginate: UserPaginator
}

export interface UsersQueryVariables {
    filter?: UserFilterInput | null
    order_by?: UserOrderInput | null
}

export interface UsersQueryResult {
    users: User[]
}

export interface UserQueryVariables {
    id: string
}

export interface UserQueryResult {
    user: User
}

export interface CreateUserMutationVariables {
    input: UserCreateInput
}

export interface CreateUserMutationResult {
    createUser: User
}

export interface UpdateUserMutationVariables {
    id: string
    input: UserUpdateInput
}

export interface UpdateUserMutationResult {
    updateUser: User
}

export interface DeleteUserMutationVariables {
    id: string
}

export interface DeleteUserMutationResult {
    deleteUser: User
}

export interface ToggleUserStatusMutationVariables {
    id: string
    status: UserStatus
}

export interface ToggleUserStatusMutationResult {
    toggleUserStatus: User
}

export interface UploadUserImageMutationVariables {
    id: string
    image: File
}

export interface UploadUserImageMutationResult {
    uploadUserImage: User
}

export interface ChangeUserPasswordMutationVariables {
    id: string
    current_password: string
    new_password: string
    confirm_new_password: string
}

export interface ChangeUserPasswordMutationResult {
    changeUserPassword: User
}
