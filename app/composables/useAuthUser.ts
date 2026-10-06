export interface AuthUser {
    id: string | number
    name: string | null
    email: string | null
    status: string | null
    initial_name?: string | null
}

export interface AuthSession {
    user?: AuthUser | null
}

function getUserInitials(name: string | null | undefined) {
    if (!name) return 'U'

    const parts = name.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
        return `${parts[0]!.charAt(0)}${parts[1]!.charAt(0)}`.toUpperCase()
    }

    return name.slice(0, 2).toUpperCase() || 'U'
}

export function useAuthUser() {
    const {
        status,
        data,
        lastRefreshedAt,
        getSession,
        signOut,
    } = useAuth()

    const session = computed(() => (data.value as AuthSession | null | undefined) ?? null)
    const user = computed<AuthUser | null>(() => session.value?.user ?? null)

    const userId = computed(() => user.value?.id ?? null)
    const userName = computed(() => user.value?.name?.trim() || null)
    const userEmail = computed(() => user.value?.email ?? null)
    const userStatus = computed(() => user.value?.status ?? null)
    const userInitials = computed(() => user.value?.initial_name?.trim() || getUserInitials(userName.value))
    const isAuthenticated = computed(() => status.value === 'authenticated')

    return {
        status,
        data,
        session,
        user,
        userId,
        userName,
        userEmail,
        userStatus,
        userInitials,
        isAuthenticated,
        lastRefreshedAt,
        getSession,
        signOut,
    }
}
