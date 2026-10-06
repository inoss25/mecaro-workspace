import type { AdministratorOrderInput, AdministratorStatus, Gender } from '../types'

export const GENDER_OPTIONS: { value: Gender, label: string }[] = [
    { value: 'MALE', label: 'Homme' },
    { value: 'FEMALE', label: 'Femme' },
]

export const STATUS_OPTIONS: { value: AdministratorStatus, label: string }[] = [
    { value: 'ACTIVE', label: 'Actif' },
    { value: 'INACTIVE', label: 'Inactif' },
    { value: 'BLOCKED', label: 'Bloqué' },
]

export type AdministratorOrderKey = 'created_desc' | 'created_asc' | 'first_name_asc' | 'last_name_asc' | 'updated_desc'

export const ADMINISTRATOR_ORDER_OPTIONS: { value: AdministratorOrderKey, label: string, orderBy: AdministratorOrderInput }[] = [
    { value: 'created_desc', label: 'Plus récents', orderBy: { column: 'CREATED_AT', order: 'DESC' } },
    { value: 'created_asc', label: 'Plus anciens', orderBy: { column: 'CREATED_AT', order: 'ASC' } },
    { value: 'first_name_asc', label: 'Prénom A → Z', orderBy: { column: 'FIRST_NAME', order: 'ASC' } },
    { value: 'last_name_asc', label: 'Nom A → Z', orderBy: { column: 'LAST_NAME', order: 'ASC' } },
    { value: 'updated_desc', label: 'Mis à jour', orderBy: { column: 'UPDATED_AT', order: 'DESC' } },
]

export function genderLabel(gender: Gender | null | undefined) {
    return GENDER_OPTIONS.find(option => option.value === gender)?.label ?? '—'
}

export function statusLabel(status: AdministratorStatus | null | undefined) {
    return STATUS_OPTIONS.find(option => option.value === status)?.label ?? '—'
}

export function statusClass(status: AdministratorStatus | null | undefined) {
    if (status === 'ACTIVE') return 'bg-primary/10 text-primary'
    if (status === 'BLOCKED') return 'bg-red-50 text-red-700'
    if (status === 'INACTIVE') return 'bg-neutral-100 text-neutral-600'
    return 'bg-neutral-100 text-neutral-500'
}

export function orderByFromKey(key: AdministratorOrderKey): AdministratorOrderInput {
    return ADMINISTRATOR_ORDER_OPTIONS.find(option => option.value === key)?.orderBy
        ?? { column: 'CREATED_AT', order: 'DESC' }
}
