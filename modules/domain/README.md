# Module domain (DDD)

Architecture domain-driven pour Nuxt : routes, i18n et auto-imports par domaine.

## Installation (déjà configuré)

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    './modules/domain/index.ts', // installe pages + i18n
    '@nuxtjs/i18n',
  ],
  domain: {
    domainsDir: 'app/domains',
    strict: false,
    pages: { routeDoc: { outDir: '.nuxt/domain-pages' } },
    i18n: { sharedI18nDirs: ['app/shared/i18n'] },
  },
})
```

## Commandes

| Commande | Description |
|----------|-------------|
| `pnpm create:domain <name>` | Crée un squelette de domaine dans `app/domains/` |
| `pnpm test:modules` | Tests unitaires de l'écosystème domain |
| `pnpm check:i18n` | Vérifie les clés `t('…')` vs JSON compilé |

## Structure interne

```
modules/domain/
├── README.md       ← cette doc
├── index.ts        # Module composite (point d'entrée Nuxt)
├── module.ts
├── types.ts
├── shared/         # Logique partagée (paths, config-loader, types)
├── pages/          # Routes + auto-imports + route-map
└── i18n/           # Agrégation i18n → @nuxtjs/i18n
```

## Sous-modules

- [`shared/README.md`](./shared/README.md) — utilitaires internes
- [`pages/README.md`](./pages/README.md) — génération de routes
- [`i18n/README.md`](./i18n/README.md) — compilation des locales
