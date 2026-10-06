export type Gender = 'MALE' | 'FEMALE'

export type AdministratorStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED'

export type SortOrder = 'ASC' | 'DESC'

export type AdministratorOrderByColumn = 'FIRST_NAME' | 'LAST_NAME' | 'CREATED_AT' | 'UPDATED_AT'

export interface Administrator {
    id: string
    first_name: string
    last_name: string
    name: string
    initial_name: string
    email: string
    email_verified_at: string | null
    status: AdministratorStatus
    gender: Gender | null
    birth_date: string | null
    image_url: string | null
    created_at: string
    updated_at: string
    deleted_at: string | null
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

export interface AdministratorPaginator {
    data: Administrator[]
    paginatorInfo: PaginatorInfo
}

export interface AdministratorCreateInput {
    first_name: string
    last_name: string
    email: string
    status: AdministratorStatus
    password?: string | null
    image?: File | null
    gender?: Gender | null
    birth_date?: string | null
}

export interface AdministratorUpdateInput {
    first_name?: string | null
    last_name?: string | null
    email?: string | null
    status?: AdministratorStatus | null
    password?: string | null
    image?: File | null
    gender?: Gender | null
    birth_date?: string | null
}

export interface AdministratorFilterInput {
    search?: string | null
    gender?: Gender | null
    status?: AdministratorStatus | null
}

export interface AdministratorOrderInput {
    column: AdministratorOrderByColumn
    order: SortOrder
}

export interface AdministratorPaginatorInput {
    order_by?: AdministratorOrderInput | null
    filter?: AdministratorFilterInput | null
    first?: number | null
    page?: number | null
}

export interface AdministratorPaginateQueryVariables {
    input?: AdministratorPaginatorInput | null
}

export interface AdministratorPaginateQueryResult {
    administratorPaginate: AdministratorPaginator
}

export interface AdministratorsQueryVariables {
    filter?: AdministratorFilterInput | null
    order_by?: AdministratorOrderInput | null
}

export interface AdministratorsQueryResult {
    administrators: Administrator[]
}

export interface AdministratorQueryVariables {
    id: string
}

export interface AdministratorQueryResult {
    administrator: Administrator
}

export interface CreateAdministratorMutationVariables {
    input: AdministratorCreateInput
}

export interface CreateAdministratorMutationResult {
    createAdministrator: Administrator
}

export interface UpdateAdministratorMutationVariables {
    id: string
    input: AdministratorUpdateInput
}

export interface UpdateAdministratorMutationResult {
    updateAdministrator: Administrator
}

export interface DeleteAdministratorMutationVariables {
    id: string
}

export interface DeleteAdministratorMutationResult {
    deleteAdministrator: Administrator
}

export interface ToggleAdministratorStatusMutationVariables {
    id: string
    status: AdministratorStatus
}

export interface ToggleAdministratorStatusMutationResult {
    toggleAdministratorStatus: Administrator
}

export interface UploadAdministratorImageMutationVariables {
    id: string
    image: File
}

export interface UploadAdministratorImageMutationResult {
    uploadAdministratorImage: Administrator
}

export interface ChangeAdministratorPasswordMutationVariables {
    id: string
    current_password: string
    new_password: string
    confirm_new_password: string
}

export interface ChangeAdministratorPasswordMutationResult {
    changeAdministratorPassword: Administrator
}
