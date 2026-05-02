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
    bgPrimary: isDark.value ? 'bg-app-bg-dark' : 'bg-app-bg',
    bgSecondary: isDark.value ? 'bg-app-surface-dark' : 'bg-app-surface',
    bgTertiary: isDark.value ? 'bg-app-surface-muted-dark' : 'bg-app-surface-muted',
    textPrimary: isDark.value ? 'text-app-text-dark' : 'text-app-text',
    textSecondary: isDark.value ? 'text-app-muted-dark' : 'text-app-muted',
    textMuted: isDark.value ? 'text-app-muted-dark' : 'text-app-muted',
    border: isDark.value ? 'border-app-border-dark' : 'border-app-border',
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
