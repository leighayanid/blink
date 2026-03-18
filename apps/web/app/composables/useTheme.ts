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
    bgPrimary: isDark.value ? 'bg-swiss-bg-dark' : 'bg-swiss-bg',
    bgSecondary: isDark.value ? 'bg-swiss-paper-dark' : 'bg-swiss-paper',
    bgTertiary: isDark.value ? 'bg-swiss-bg-dark' : 'bg-swiss-bg',
    textPrimary: isDark.value ? 'text-white' : 'text-swiss-black',
    textSecondary: isDark.value ? 'text-swiss-grey-light' : 'text-swiss-grey',
    textMuted: isDark.value ? 'text-swiss-grey' : 'text-swiss-grey-light',
    border: isDark.value ? 'border-swiss-border-dark' : 'border-swiss-black',
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
