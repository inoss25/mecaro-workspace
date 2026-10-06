import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'

export const useApolloClient = () => {
    const token = useCookie('token')
    const config = useRuntimeConfig()

    let currentLocale = 'fr'
    try {
        const i18n = useI18n()
        currentLocale = i18n.locale.value || 'fr'
    }
    catch (error) {
        console.warn('[Apollo] useI18n unavailable, fallback locale=fr', error)
    }

    const uri = config.public.gqlHost as string | undefined

    console.log('[Apollo] create client', {
        uri,
        hasToken: Boolean(token.value),
        tokenPreview: token.value ? `${String(token.value).slice(0, 12)}…` : null,
        locale: currentLocale,
        isClient: import.meta.client,
    })

    if (!uri) {
        console.error('[Apollo] gqlHost is missing (NUXT_PUBLIC_GQL_HOST)')
    }

    const httpLink = createHttpLink({
        uri: uri || '',
    })

    const authLink = setContext((_, { headers }) => {
        const authToken = token.value

        console.log('[Apollo] setContext headers', {
            hasToken: Boolean(authToken),
            locale: currentLocale,
        })

        return {
            headers: {
                ...headers,
                ...(authToken && { authorization: `Bearer ${authToken}` }),
                'Accept-Language': currentLocale,
            },
        }
    })

    return new ApolloClient({
        link: authLink.concat(httpLink),
        cache: new InMemoryCache(),
        defaultOptions: {
            query: {
                fetchPolicy: 'network-only',
            },
        },
    })
}
