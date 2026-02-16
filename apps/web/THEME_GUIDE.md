# Dark/Light Mode Theme Guide

This guide explains how to use the dark/light mode theme system in the Blink application using `@nuxtjs/color-mode` and Tailwind CSS.

## Overview

The theme system is built with:
- **@nuxtjs/color-mode**: Manages theme switching and persistence
- **Tailwind CSS**: Provides theme utilities and responsive classes
- **Custom composable**: `useTheme()` for easy theme management
- **CSS Variables**: Fallback support for components using CSS custom properties

## Setup

The theme configuration is already set up in your project:

### Files Created/Modified:
1. `tailwind.config.ts` - Tailwind theme configuration with light/dark colors
2. `app/composables/useTheme.ts` - Theme management composable
3. `nuxt.config.ts` - Updated with Tailwind and color-mode config
4. `app.vue` - Root component with dark mode class binding

## Using the Theme

### Option 1: Using the `useTheme()` Composable (Recommended)

```vue
<template>
  <div>
    <button @click="toggleTheme">
      {{ isDark ? '🌙 Dark' : '☀️ Light' }}
    </button>

    <p class="text-light-primary dark:text-dark-primary">
      This text changes with theme
    </p>
  </div>
</template>

<script setup lang="ts">
const { isDark, toggleTheme, themeClasses } = useTheme()
</script>
```

### Option 2: Using Tailwind Dark Mode Classes

Use the `dark:` prefix for dark mode styles:

```vue
<template>
  <div class="bg-light-primary dark:bg-dark-primary text-light-primary dark:text-dark-primary">
    <h1 class="text-gray-900 dark:text-white">Responsive to theme</h1>
  </div>
</template>
```

### Option 3: Using CSS Variables (Legacy Components)

All CSS variables are available for backward compatibility:

```vue
<style scoped>
.card {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--color-primary);
}
</style>
```

## Theme Colors

### Available Color Utilities in Tailwind

#### Primary Colors
- `bg-primary-*` / `text-primary-*` - Orange theme colors (50-900)
- `dark:bg-dark-primary` / `dark:text-dark-primary` - Dark backgrounds

#### Background Colors
- `bg-light-primary` - Light mode primary background (#FFFAF0)
- `bg-light-secondary` - Light mode secondary background (#FFFFFF)
- `bg-light-tertiary` - Light mode tertiary background (#FFF8E7)
- `dark:bg-dark-primary` - Dark mode primary background (#0F1419)
- `dark:bg-dark-secondary` - Dark mode secondary background (#1A2332)
- `dark:bg-dark-tertiary` - Dark mode tertiary background (#2D3E52)

#### Text Colors
- `text-light-primary` - Light mode primary text (#2C3E50)
- `text-light-secondary` - Light mode secondary text (#7F8C8D)
- `text-light-muted` - Light mode muted text (#95A5A6)
- `dark:text-dark-primary` - Dark mode primary text (#F5F7FA)
- `dark:text-dark-secondary` - Dark mode secondary text (#B0B8C1)
- `dark:text-dark-muted` - Dark mode muted text (#8A92A0)

#### Status Colors
- `text-status-success` - Green (#10B981)
- `text-status-error` - Red (#EF4444)
- `text-status-warning` - Amber (#F59E0B)
- `text-status-info` - Blue (#3B82F6)

### CSS Variables (for backward compatibility)

```css
/* Light Mode Variables */
--color-primary: #FFA500
--color-secondary: #FF8C42
--color-accent: #FFD700
--bg-primary: #FFFAF0
--bg-secondary: #FFFFFF
--bg-tertiary: #FFF8E7
--text-primary: #2C3E50
--text-secondary: #7F8C8D
--text-light: #95A5A6

/* Status Colors */
--color-success: #10B981
--color-error: #EF4444
--color-warning: #F59E0B

/* Shadows */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05)
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1)
--shadow-lg: (changes in dark mode)
```

## Theme Composable API

### `useTheme()`

```typescript
const {
  // State
  colorMode,        // Raw color-mode composable
  isDark,           // Computed: boolean indicating dark mode
  isLight,          // Computed: boolean indicating light mode

  // Methods
  toggleTheme(),    // Toggle between light and dark
  setDarkMode(bool),  // Explicitly set dark mode (true = dark, false = light)

  // Utilities
  getThemeClass(light, dark),  // Get appropriate class based on theme
  getThemeColor(light, dark),  // Get appropriate color based on theme

  // Pre-computed classes
  themeClasses      // Computed object with ready-to-use Tailwind classes
} = useTheme()

// themeClasses object:
// {
//   bgPrimary: string     // bg-light-primary or bg-dark-primary
//   bgSecondary: string   // bg-light-secondary or bg-dark-secondary
//   bgTertiary: string    // bg-light-tertiary or bg-dark-tertiary
//   textPrimary: string   // text-light-primary or text-dark-primary
//   textSecondary: string // text-light-secondary or text-dark-secondary
//   textMuted: string     // text-light-muted or text-dark-muted
//   border: string        // border-neutral-200 or border-neutral-700
// }
```

## Example Components

### Theme Toggle Button

```vue
<template>
  <button
    @click="toggleTheme"
    class="p-2 rounded-lg bg-primary-100 dark:bg-primary-700 hover:bg-primary-200 dark:hover:bg-primary-600 transition-colors"
  >
    <span v-if="isDark">🌙</span>
    <span v-else>☀️</span>
  </button>
</template>

<script setup lang="ts">
const { isDark, toggleTheme } = useTheme()
</script>
```

### Card Component with Theme Support

```vue
<template>
  <div :class="themeClasses.bgSecondary" class="p-6 rounded-lg shadow-md">
    <h2 :class="themeClasses.textPrimary" class="text-lg font-bold">
      Card Title
    </h2>
    <p :class="themeClasses.textSecondary" class="mt-2">
      Card content
    </p>
  </div>
</template>

<script setup lang="ts">
const { themeClasses } = useTheme()
</script>
```

### Custom Component with Manual Class Binding

```vue
<template>
  <div
    :class="[
      'p-4 rounded-lg transition-colors duration-300',
      isDark
        ? 'bg-dark-secondary text-dark-primary'
        : 'bg-light-secondary text-light-primary'
    ]"
  >
    <p>Dynamic theme styling</p>
  </div>
</template>

<script setup lang="ts">
const { isDark } = useTheme()
</script>
```

## Dark Mode Detection

The dark mode class is applied to the root `<html>` element automatically by `@nuxtjs/color-mode`. This enables:

1. **Tailwind dark mode**: Use `dark:` prefix for dark mode styles
2. **CSS selectors**: Use `html.dark` selector in styles
3. **JavaScript detection**: Use `useTheme()` to check theme state

## Storage

Theme preference is automatically saved to localStorage using the key `blink-theme`. This persists the user's preference across sessions.

## Customization

### Adding New Theme Colors

Edit `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      custom: {
        light: '#YOURCOLOR',
        dark: '#YOURCOLOR'
      }
    }
  }
}
```

### Changing Color Scheme

The color scheme variables are in `app.vue`. Modify the `:root` and `html.dark` selectors to change the color scheme.

### Adjusting Transition Duration

Change the `duration-300` class in components or modify the `transitionDuration` in `tailwind.config.ts`.

## Browser Support

The theme system works on all modern browsers that support:
- CSS Custom Properties (CSS Variables)
- CSS media queries
- localStorage

## Performance Notes

- Theme switching uses CSS transitions for smooth visual changes
- localStorage is used for persistence (no server calls)
- The `useTheme()` composable uses Vue reactivity for efficient updates
- Dark mode class is applied to `html` element for optimal Tailwind performance

## Troubleshooting

### Theme not changing
1. Make sure `@nuxtjs/color-mode` is installed and configured
2. Check that `colorMode.preference` is being set correctly
3. Verify that the `dark` class is applied to the HTML element

### Styles not applying in dark mode
1. Ensure you're using `dark:` prefix for Tailwind classes
2. Check that the CSS variable fallback is correct
3. Verify that `tailwind.config.ts` has `darkMode: 'class'`

### Colors not persisting
1. Check browser localStorage for `blink-theme` key
2. Ensure `storageKey: 'blink-theme'` is in `nuxt.config.ts`
3. Clear cache and rebuild if needed

## Next Steps

1. Update existing components to use the new theme utilities
2. Remove hard-coded colors from components
3. Use `useTheme()` composable for theme-aware styling
4. Test dark mode on all pages and components
