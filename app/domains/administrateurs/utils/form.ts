import type { Administrator, AdministratorCreateInput, AdministratorStatus, AdministratorUpdateInput, Gender } from '../types'

export interface AdministratorFormState {
    first_name: string
    last_name: string
    email: string
    password: string
    password_confirmation: string
    gender: Gender | ''
    status: AdministratorStatus | ''
    birth_date: string
}

export interface AdministratorPasswordFormState {
    current_password: string
    new_password: string
    confirm_new_password: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function emptyAdministratorForm(): AdministratorFormState {
    return {
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
        gender: '',
        status: 'ACTIVE',
        birth_date: '',
    }
}

export function emptyPasswordForm(): AdministratorPasswordFormState {
    return {
        current_password: '',
        new_password: '',
        confirm_new_password: '',
    }
}

export function todayInputValue() {
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${now.getFullYear()}-${month}-${day}`
}

export function formFromAdministrator(administrator: Administrator): AdministratorFormState {
    return {
        first_name: administrator.first_name,
        last_name: administrator.last_name,
        email: administrator.email,
        password: '',
        password_confirmation: '',
        gender: administrator.gender ?? '',
        status: administrator.status,
        birth_date: administrator.birth_date ? administrator.birth_date.slice(0, 10) : '',
    }
}

export function validateAdministratorImage(file: File) {
    if (!file.type.startsWith('image/')) return 'Choisissez un fichier image.'
    if (file.size > 2 * 1024 * 1024) return 'L’image doit faire moins de 2 Mo.'
    return ''
}

export function validateAdministratorForm(form: AdministratorFormState, mode: 'create' | 'edit') {
    const errors: Record<string, string> = {}
    const email = form.email.trim()
    const today = todayInputValue()

    if (!form.first_name.trim()) errors.first_name = 'Le prénom est requis.'
    if (!form.last_name.trim()) errors.last_name = 'Le nom est requis.'
    if (!email) errors.email = 'L’adresse e-mail est requise.'
    else if (!EMAIL_PATTERN.test(email)) errors.email = 'Adresse e-mail invalide.'
    if (!form.status) errors.status = 'Le statut est requis.'

    if (mode === 'create' && (form.password || form.password_confirmation)) {
        if (form.password.length < 8) errors.password = 'Au moins 8 caractères.'
        if (form.password !== form.password_confirmation) {
            errors.password_confirmation = 'Les mots de passe ne correspondent pas.'
        }
    }

    if (form.birth_date && form.birth_date > today) {
        errors.birth_date = 'La date de naissance ne peut pas être dans le futur.'
    }

    return errors
}

export function validatePasswordForm(form: AdministratorPasswordFormState) {
    const errors: Record<string, string> = {}

    if (!form.current_password) errors.current_password = 'Le mot de passe actuel est requis.'
    if (!form.new_password) errors.new_password = 'Le nouveau mot de passe est requis.'
    else if (form.new_password.length < 8) errors.new_password = 'Au moins 8 caractères.'
    if (form.new_password !== form.confirm_new_password) {
        errors.confirm_new_password = 'Les mots de passe ne correspondent pas.'
    }

    return errors
}

export function toAdministratorCreateInput(form: AdministratorFormState): AdministratorCreateInput {
    const input: AdministratorCreateInput = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        status: form.status as AdministratorStatus,
    }

    if (form.password) input.password = form.password
    if (form.gender) input.gender = form.gender
    if (form.birth_date) input.birth_date = form.birth_date

    return input
}

export function toAdministratorUpdateInput(form: AdministratorFormState): AdministratorUpdateInput {
    return {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        gender: form.gender || null,
        birth_date: form.birth_date || null,
        status: form.status || null,
    }
}
