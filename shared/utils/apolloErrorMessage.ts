const COMBINED_PREFIX = "CombinedGraphQLErrors: ";

function normalizeMessage(msg: string | undefined): string | undefined {
    if (!msg || typeof msg !== "string") return msg;
    return msg.startsWith(COMBINED_PREFIX)
        ? msg.slice(COMBINED_PREFIX.length).trim()
        : msg;
}

export const getApolloErrorMessage = (error: any): string => {
    const raw =
        error?.graphQLErrors?.[0]?.extensions?.debugMessage ||
        error?.graphQLErrors?.[0]?.message ||
        error?.errors?.[0]?.extensions?.debugMessage ||
        error?.errors?.[0]?.message ||
        error?.networkError?.message ||
        error?.message;
    const message = normalizeMessage(raw);
    return message || "Une erreur inconnue est survenue";
};


export const extractErrorMessage = (error: unknown): string => {
    try {
        return getApolloErrorMessage(error)
    }
    catch {
        if (error instanceof Error) return error.message
        return 'Une erreur inconnue est survenue'
    }
}
