export type AppLocale = {
    code: string
    name?: string
    flag?: string
    language?: string
    iso?: string
    isRTL?: boolean
    dir?: 'ltr' | 'rtl' | 'auto'
}

export type AppLocaleOption = {
    code: string
    label: string
    shortCode: string
    flag: string
    language: string
    isRTL: boolean
}

function toAppLocale(value: unknown): AppLocale | undefined {
    if (typeof value !== 'object' || value === null) return undefined
    if (!('code' in value) || typeof value.code !== 'string') return undefined
    return value as AppLocale
}

export function useLocale() {
    const { locale, locales, localeProperties, setLocale, t, te } = useI18n()

    const availableLocales = computed(() =>
        locales.value.flatMap((entry) => {
            const parsed = toAppLocale(entry)
            return parsed ? [parsed] : []
        }),
    )

    const localesByCode = computed(
        () => new Map(availableLocales.value.map(entry => [entry.code, entry])),
    )

    function getLocaleEntry(code: string) {
        return localesByCode.value.get(code)
    }

    function getLocaleCode(code: string) {
        return code.toUpperCase()
    }

    function getLocaleName(code: string) {
        const key = `global.locales.${code}`
        if (te(key)) return t(key)

        return getLocaleEntry(code)?.name ?? getLocaleCode(code)
    }

    function getLocaleFlag(code: string) {
        return getLocaleEntry(code)?.flag ?? `/assets/locales/${code}.svg`
    }

    function getLocaleLanguage(code: string) {
        const entry = getLocaleEntry(code)
        return entry?.language ?? entry?.iso ?? code
    }

    function isLocaleRTL(code: string) {
        const entry = getLocaleEntry(code)
        return entry?.dir === 'rtl' || entry?.isRTL === true
    }

    const options = computed<AppLocaleOption[]>(() =>
        availableLocales.value.map(entry => ({
            code: entry.code,
            label: getLocaleName(entry.code),
            shortCode: getLocaleCode(entry.code),
            flag: getLocaleFlag(entry.code),
            language: getLocaleLanguage(entry.code),
            isRTL: isLocaleRTL(entry.code),
        })),
    )

    const currentLocale = computed(() =>
        getLocaleEntry(locale.value) ?? toAppLocale(localeProperties.value),
    )

    const currentOption = computed(() =>
        options.value.find(option => option.code === locale.value),
    )

    const currentLocaleName = computed(() =>
        currentOption.value?.label ?? getLocaleName(locale.value),
    )

    const currentLocaleCode = computed(() =>
        currentOption.value?.shortCode ?? getLocaleCode(locale.value),
    )

    const currentLocaleFlag = computed(() =>
        currentOption.value?.flag ?? getLocaleFlag(locale.value),
    )

    const isRTL = computed(() =>
        currentOption.value?.isRTL ?? isLocaleRTL(locale.value),
    )

    function isConfiguredLocale(code: string): code is typeof locale.value {
        return localesByCode.value.has(code)
    }

    async function selectLocale(code: string) {
        if (code === locale.value || !isConfiguredLocale(code)) return
        await setLocale(code)
    }

    return {
        locale,
        availableLocales,
        options,
        currentLocale,
        currentOption,
        currentLocaleName,
        currentLocaleCode,
        currentLocaleFlag,
        isRTL,
        selectLocale,
        getLocaleCode,
        getLocaleName,
        getLocaleFlag,
    }
}
