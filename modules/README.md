# Modules Nuxt internes

Dossier racine des **modules Nuxt locaux** du projet. Chaque sous-dossier est un module (ou un groupe de modules) indépendant.

## Modules disponibles

| Dossier | Description | Entrée Nuxt |
|---------|-------------|-------------|
| [`domain/`](./domain/) | Architecture DDD : routes, i18n, auto-imports par domaine | `./modules/domain/index.ts` |

## Ajouter un nouveau module

1. Créer un dossier `modules/<nom>/` avec `index.ts` (export du module Nuxt).
2. Documenter dans un `README.md` à l'intérieur de ce dossier.
3. Enregistrer le module dans `nuxt.config.ts`.
4. Ajouter les tests sous `modules/<nom>/tests/` (détectés par Vitest).

Exemple de structure :

```
modules/
├── README.md           ← cet index
├── domain/             ← écosystème DDD existant
│   ├── README.md
│   ├── index.ts
│   ├── pages/
│   ├── i18n/
│   └── shared/
└── mon-module/         ← futur module utilitaire
    ├── README.md
    ├── index.ts
    └── runtime/
```
