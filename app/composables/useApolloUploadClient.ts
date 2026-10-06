//@ts-ignore
import UploadHttpLink from 'apollo-upload-client/UploadHttpLink.mjs'
import { ApolloClient, from, InMemoryCache } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import type { NormalizedCacheObject } from '@apollo/client/cache'

let client: ApolloClient<NormalizedCacheObject> | null = null

export const useApolloUploadClient = () => {
    const config = useRuntimeConfig()
    const { locale } = useI18n()
    const cookieToken = useCookie('auth.token')

    if (!client) {
        const authLink = setContext((_, { headers }) => {
            const authToken = cookieToken.value
                || (import.meta.client ? localStorage.getItem('auth.token') : null)

            return {
                headers: {
                    ...headers,
                    ...(authToken && { Authorization: `Bearer ${authToken}` }),
                    'Accept-Language': locale.value || 'fr',
                },
            }
        })

        //@ts-ignore
        const httpLink = new UploadHttpLink({
            uri: config.public.gqlHost,
            credentials: 'same-origin',
        })

        client = new ApolloClient({
            cache: new InMemoryCache(),
            defaultOptions: {
                watchQuery: {
                    fetchPolicy: 'no-cache',
                },
                query: {
                    fetchPolicy: 'no-cache',
                },
            },
            link: from([authLink, httpLink]),
        })
    }

    return client
}
