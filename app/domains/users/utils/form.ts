import type { Gender, User, UserCreateInput, UserStatus, UserUpdateInput } from '../types'

export interface UserFormState {
    first_name: string
    last_name: string
    email: string
    phone_number: string
    password: string
    password_confirmation: string
    gender: Gender | ''
    status: UserStatus | ''
    birth_date: string
}

export interface UserPasswordFormState {
    current_password: string
    new_password: string
    confirm_new_password: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function emptyUserForm(): UserFormState {
    return {
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        password: '',
        password_confirmation: '',
        gender: '',
        status: 'ACTIVE',
        birth_date: '',
    }
}

export function emptyPasswordForm(): UserPasswordFormState {
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

export function formFromUser(user: User): UserFormState {
    return {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email ?? '',
        phone_number: user.phone_number ?? '',
        password: '',
        password_confirmation: '',
        gender: user.gender ?? '',
        status: user.status ?? '',
        birth_date: user.birth_date ? user.birth_date.slice(0, 10) : '',
    }
}

export function validateUserImage(file: File) {
    if (!file.type.startsWith('image/')) return 'Choisissez un fichier image.'
    if (file.size > 2 * 1024 * 1024) return 'L’image doit faire moins de 2 Mo.'
    return ''
}

export function validateUserForm(form: UserFormState, mode: 'create' | 'edit') {
    const errors: Record<string, string> = {}
    const email = form.email.trim()
    const phone = form.phone_number.trim()
    const today = todayInputValue()

    if (!form.first_name.trim()) errors.first_name = 'Le prénom est requis.'
    if (!form.last_name.trim()) errors.last_name = 'Le nom est requis.'
    if (email && !EMAIL_PATTERN.test(email)) errors.email = 'Adresse e-mail invalide.'
    if (phone && phone.replace(/\D/g, '').length < 8) errors.phone_number = 'Numéro de téléphone invalide.'
    if (!form.status) errors.status = 'Le statut est requis.'

    if (mode === 'create' && (form.password || form.password_confirmation)) {
        if (form.password.length < 8) errors.password = 'Au moins 8 caractères.'
        if (form.password !== form.password_confirmation) {
            errors.password_confirmation = 'Les mots de passe ne correspondent pas.'
        }
    }

    if (mode === 'edit' && form.birth_date && form.birth_date > today) {
        errors.birth_date = 'La date de naissance ne peut pas être dans le futur.'
    }

    return errors
}

export function validatePasswordForm(form: UserPasswordFormState) {
    const errors: Record<string, string> = {}

    if (!form.current_password) errors.current_password = 'Le mot de passe actuel est requis.'
    if (!form.new_password) errors.new_password = 'Le nouveau mot de passe est requis.'
    else if (form.new_password.length < 8) errors.new_password = 'Au moins 8 caractères.'
    if (form.new_password !== form.confirm_new_password) {
        errors.confirm_new_password = 'Les mots de passe ne correspondent pas.'
    }

    return errors
}

export function toUserCreateInput(form: UserFormState): UserCreateInput {
    const input: UserCreateInput = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
    }
    const email = form.email.trim()
    const phone = form.phone_number.trim()

    if (email) input.email = email
    if (form.password) input.password = form.password
    if (phone) input.phone_number = phone
    if (form.gender) input.gender = form.gender
    if (form.status) input.status = form.status

    return input
}

export function toUserUpdateInput(form: UserFormState): UserUpdateInput {
    return {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim() || null,
        phone_number: form.phone_number.trim() || null,
        gender: form.gender || null,
        birth_date: form.birth_date || null,
        status: form.status || null,
    }
}
