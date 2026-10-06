export type ColorModePreference = 'light' | 'dark' | 'system'

export type ColorModeOption = {
    value: ColorModePreference
    label: string
    icon: string
}

const colorModePreferences = ['light', 'dark', 'system'] as const satisfies readonly ColorModePreference[]

const colorModeIcons: Record<ColorModePreference, string> = {
    light: 'fa-regular fa-sun',
    dark: 'fa-regular fa-moon',
    system: 'fa-solid fa-desktop',
}

function isColorModePreference(value: string): value is ColorModePreference {
    return colorModePreferences.includes(value as ColorModePreference)
}

export function useAppColorMode() {
    const colorMode = useColorMode()
    const { t } = useI18n()

    const isDark = computed(() => colorMode.value === 'dark')
    const isUnknown = computed(() => colorMode.unknown)

    const options = computed<ColorModeOption[]>(() =>
        colorModePreferences.map(value => ({
            value,
            label: t(`global.colorMode.${value}`),
            icon: colorModeIcons[value],
        })),
    )

    const currentOption = computed(() =>
        options.value.find(option => option.value === colorMode.preference)
        ?? options.value.find(option => option.value === 'system')
        ?? options.value[0],
    )

    const currentIcon = computed(() =>
        isDark.value ? colorModeIcons.dark : colorModeIcons.light,
    )

    const currentLabel = computed(() => currentOption.value?.label ?? '')

    function setPreference(value: string) {
        if (!isColorModePreference(value)) return
        colorMode.preference = value
    }

    function toggleColorMode() {
        setPreference(isDark.value ? 'light' : 'dark')
    }

    return {
        colorMode,
        isDark,
        isUnknown,
        options,
        currentOption,
        currentIcon,
        currentLabel,
        setPreference,
        toggleColorMode,
    }
}
