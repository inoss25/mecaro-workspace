// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    runtimeConfig: {
        // The private keys which are only available server-side
        API_BASE_URL: process.env.NUXT_PUBLIC_API_HOST,
        // Keys within public are also exposed client-side
        public: {
            apiBaseUrl: process.env.NUXT_PUBLIC_API_HOST,
            authOrigin: process.env.NUXT_PUBLIC_AUTH_ORIGIN,
            gqlHost: process.env.NUXT_PUBLIC_GQL_HOST,
        },
    },
    css: ['~/assets/css/main.css', '~/assets/fonts/fontawesome/css/all.min.css'],
    modules: [
        './modules/domain/index.ts',
        '@pinia/nuxt',
        '@vueuse/nuxt',
        '@nuxtjs/color-mode',
        '@nuxtjs/device',
        '@nuxtjs/i18n',
        '@nuxt/fonts',
        '@sidebase/nuxt-auth',
        'nuxt-charts'
    ],

    auth: {
        isEnabled: true,
        //disableServerSideAuth: false,
        originEnvKey: process.env.NUXT_PUBLIC_AUTH_ORIGIN,
        baseURL: process.env.NUXT_PUBLIC_AUTH_ORIGIN,
        provider: {
            type: 'local',
            endpoints: {
                signUp: false,
                signIn: { path: '/login', method: 'post' },
                signOut: { path: '/logout', method: 'post' },
                //signUp: { path: '/register', method: 'post' },
                getSession: { path: '/session', method: 'get' },
            },
            pages: {
                login: '/',
            },
            token: {
                signInResponseTokenPointer: '/token',
                type: 'Bearer',
                cookieName: 'token',
                headerName: 'Authorization',
                //maxAgeInSeconds: 365 * 24 * 60 * 60
            }
        },
        sessionRefresh: {
            enablePeriodically: false,
            enableOnWindowFocus: false,
        },
        globalAppMiddleware: true,
    },

    colorMode: {
        classSuffix: '',
        preference: 'system',
        fallback: 'light',
    },

    domain: {
        domainsDir: 'app/domains',
        strict: false,
        debug: process.env.NODE_ENV === 'development',
        pages: {
            routeDoc: {
                enabled: true,
                outDir: '.nuxt/domain-pages',
            },
        },
        i18n: {
            sharedI18nDirs: ['app/shared/i18n'],
            outputDir: 'i18n/locales',
        },
    },

    i18n: {
        langDir: 'locales',
        defaultLocale: 'fr',
        strategy: 'prefix_except_default',
        locales: [
            { code: 'en', name: 'English', file: 'en.json', language: 'en-US', dir: 'ltr', flag: '/assets/locales/us.svg' },
            { code: 'fr', name: 'Français', file: 'fr.json', language: 'fr-FR', dir: 'ltr', flag: '/assets/locales/fr.svg' },
        ],
    },

    fonts: {
        families: [
            { name: 'Inter', provider: 'google' },
        ],
    },

    vite: {
        plugins: [tailwindcss()],
    },
})
