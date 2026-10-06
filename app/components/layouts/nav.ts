export type AppNavItem = {
    label: string
    to: string
    icon: string
    description: string
}

export type AppNavSection = {
    label: string
    items: AppNavItem[]
}

export const navSections: AppNavSection[] = [
    {
        label: 'Comptes',
        items: [
            { label: 'Utilisateur', to: '/utilisateur', icon: 'fa-solid fa-user', description: 'Compte de l’atelier' },
            { label: 'Utilisateurs', to: '/users', icon: 'fa-solid fa-users', description: 'Comptes de l’application' },
            { label: 'Administrateurs', to: '/administrateurs', icon: 'fa-solid fa-user-shield', description: 'Accès et rôles' },
        ],
    },
    {
        label: 'Parc',
        items: [
            { label: 'Engins', to: '/engins', icon: 'fa-solid fa-car-side', description: 'Véhicules suivis' },
            { label: 'Véhicules', to: '/vehicles', icon: 'fa-solid fa-car', description: 'Parc et immatriculations' },
            { label: 'Carburant', to: '/fuel-records', icon: 'fa-solid fa-gas-pump', description: 'Pleins et dépenses' },
        ],
    },
    {
        label: 'Catalogue',
        items: [
            { label: 'Types de véhicules', to: '/vehicle-types', icon: 'fa-solid fa-tags', description: 'Catégories d’engins' },
            { label: 'Marques', to: '/vehicle-brands', icon: 'fa-solid fa-industry', description: 'Constructeurs et logos' },
            { label: 'Modèles', to: '/vehicle-models', icon: 'fa-solid fa-car-rear', description: 'Modèles par marque' },
        ],
    },
    {
        label: 'Atelier',
        items: [
            { label: 'Garages', to: '/garages', icon: 'fa-solid fa-warehouse', description: 'Sites et ateliers' },
        ],
    },
    {
        label: 'Maintenance',
        items: [
            { label: 'Interventions', to: '/maintenance-records', icon: 'fa-solid fa-screwdriver-wrench', description: 'Historique des entretiens' },
            { label: 'Catégories', to: '/maintenance-categories', icon: 'fa-solid fa-layer-group', description: 'Familles d’entretien' },
            { label: 'Types', to: '/maintenance-types', icon: 'fa-solid fa-list-check', description: 'Opérations d’entretien' },
            { label: 'Pièces', to: '/maintenance-parts', icon: 'fa-solid fa-gears', description: 'Pièces utilisées' },
            { label: 'Huiles', to: '/maintenance-oils', icon: 'fa-solid fa-oil-can', description: 'Lubrifiants et fluides' },
            { label: 'Intervalles', to: '/maintenance-settings', icon: 'fa-solid fa-gauge-high', description: 'Périodicité par véhicule' },
        ],
    },
]

export const mainNav: AppNavItem[] = navSections.flatMap(section => section.items)

export function isNavItemActive(currentPath: string, to: string) {
    const path = stripLocalePrefix(currentPath)
    return path === to || path.startsWith(`${to}/`)
}

function stripLocalePrefix(path: string) {
    const prefixed = path.match(/^\/[a-z]{2}(\/.*)$/)
    return prefixed?.[1] ?? path
}
