/**
 * useTheme composable
 * Provides utilities for managing dark/light mode theme
 */
export function useTheme() {
  const colorMode = useColorMode()

  const isDark = computed(() => colorMode.value === 'dark')
  const isLight = computed(() => colorMode.value === 'light')

  const toggleTheme = () => {
    colorMode.preference = isDark.value ? 'light' : 'dark'
  }

  const setDarkMode = (dark: boolean) => {
    colorMode.preference = dark ? 'dark' : 'light'
  }

  const getThemeClass = (lightClass: string, darkClass: string) => {
    return isDark.value ? darkClass : lightClass
  }

  const getThemeColor = (lightColor: string, darkColor: string) => {
    return isDark.value ? darkColor : lightColor
  }

  const themeClasses = computed(() => ({
    bgPrimary: isDark.value ? 'bg-dark-primary' : 'bg-light-primary',
    bgSecondary: isDark.value ? 'bg-dark-secondary' : 'bg-light-secondary',
    bgTertiary: isDark.value ? 'bg-dark-tertiary' : 'bg-light-tertiary',
    textPrimary: isDark.value ? 'text-dark-primary' : 'text-light-primary',
    textSecondary: isDark.value ? 'text-dark-secondary' : 'text-light-secondary',
    textMuted: isDark.value ? 'text-dark-muted' : 'text-light-muted',
    border: isDark.value ? 'border-neutral-700' : 'border-neutral-200',
  }))

  return {
    colorMode,
    isDark,
    isLight,
    toggleTheme,
    setDarkMode,
    getThemeClass,
    getThemeColor,
    themeClasses,
  }
}
