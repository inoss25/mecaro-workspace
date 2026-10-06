import { ref } from 'vue'
import { useApolloClient } from '@/composables/useApolloClient'

/**
 * useVehicleTypeQuery - composable to query vehicle types using Apollo Client
 * @template T - Expected return type for query data
 * @param {DocumentNode} query - GraphQL query document
 * @param {Object} variables - query variables
 * @returns {Object} { data, loading, error, refetch }
 */
export function useVehicleTypeQuery<T = any>(query: any, variables: Record<string, any> = {}) {
    const data = ref<T | null>(null)
    const loading = ref(false)
    const error = ref<Error | null>(null)

    const client = useApolloClient()

    const fetch = async (customVariables?: Record<string, any>) => {
        loading.value = true
        error.value = null
        try {
            // get base example:
            // const { data } = await client.query<TestimonialsQuery>({
            //     query: GET_TESTIMONIALS,
            //     variables: variables ?? { filter: buildFilter(), order_by: buildOrderBy() },
            //     fetchPolicy: 'network-only',
            // })

            const response = await client.query<T>({
                query,
                variables: customVariables ?? variables ?? {},
                fetchPolicy: 'network-only',
            })
            data.value = response.data
        } catch (e: any) {
            error.value = e
            data.value = null
        } finally {
            loading.value = false
        }
    }

    if (import.meta.client) {
        fetch(variables)
    }

    return {
        data,
        loading,
        error,
        refetch: fetch,
    }
}
