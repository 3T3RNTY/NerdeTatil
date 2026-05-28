# Theme Migration Guide

This guide explains the unified theme system that powers both web and mobile platforms of the NerdeTatil application.

## Architecture Overview

The theme system consists of three layers:

### 1. Design Tokens (`src/theme/tokens.ts`)
Centralized JavaScript object containing all design tokens:
- **Colors** - Primary, secondary, status colors, neutrals
- **Typography** - Font sizes, weights, line heights, letter spacing
- **Spacing** - Padding, margin, gap values
- **Border Radius** - Roundness values for corners
- **Shadows** - Box shadow definitions (web CSS + React Native)
- **Breakpoints** - Responsive breakpoints (320px → 1400px+)
- **Z-Index** - Layering scale
- **Transitions** - Animation durations and timing functions

### 2. Type Definitions (`src/theme/types.ts`)
TypeScript interfaces and types for type-safe theme usage:
- `Theme` - Main theme interface
- `ColorKey`, `SpacingKey`, `FontSizeKey`, etc. - Token key types
- `ButtonVariant`, `InputSize` - Component variant types
- Helper types for responsive design

### 3. Utilities (`src/theme/utilities.ts`)
Helper functions for both platforms:
- `generateCSSVariables()` - Generate CSS custom properties
- `getCSSVariable()` - Get CSS var() reference
- `generateNativeStyleSheet()` - Generate React Native styles
- `getColor()` - Get color with optional opacity
- `getSpacing()` - Get spacing value
- `getMediaQuery()` - Generate media query string
- Viewport detection helpers

## Platform-Specific Implementation

### Web (CSS)

**Global Styles** (`src/styles/globals.css`)
- CSS custom properties (`:root { --color-primary: #0d9488; }`)
- Base element styles (html, body, h1-h6, p, a, etc.)
- Form element resets
- Print styles

**Utility Classes** (`src/styles/utilities.css`)
- Flexbox utilities (`.flex`, `.flex-center`, `.flex-between`, etc.)
- Spacing utilities (`.p-4`, `.m-2`, `.gap-3`, etc.)
- Sizing utilities (`.w-full`, `.max-w-lg`, etc.)
- Text utilities (`.text-lg`, `.font-bold`, `.text-center`, etc.)
- Component patterns (`.button-primary`, `.card`, `.input-base`, etc.)
- Responsive utilities (`.mobile-only`, `.desktop-only`, media queries)

**Import in Application**
```tsx
// In client/app/_layout.tsx
import '../src/styles/globals.css'
import '../src/styles/utilities.css'
```

### Mobile (React Native)

**StyleSheet with Tokens**
All React Native components use `StyleSheet.create()` with tokens:

```tsx
import { tokens } from '@/src/theme/tokens'

const styles = StyleSheet.create({
  container: {
    backgroundColor: tokens.colors.background,
    padding: tokens.spacing[4],
    borderRadius: tokens.borderRadius.md,
    gap: tokens.spacing[3],
  },
})
```

**Responsive Design** (Mobile)
Use `useWindowDimensions()` and tokens.breakpoints:

```tsx
import { useWindowDimensions } from 'react-native'
import { tokens } from '@/src/theme/tokens'

const isMobile = width < tokens.breakpoints.tablet
const padding = width >= tokens.breakpoints.desktop 
  ? tokens.spacing[7] 
  : tokens.spacing[4]
```

## How to Use Tokens

### In React Native Components

```tsx
import { StyleSheet } from 'react-native'
import { tokens } from '@/src/theme/tokens'

const MyComponent = () => {
  const styles = StyleSheet.create({
    container: {
      backgroundColor: tokens.colors.primaryLight,
      padding: tokens.spacing[4],
      borderRadius: tokens.borderRadius.md,
      gap: tokens.spacing[3],
    },
    text: {
      fontSize: tokens.typography.fontSize.base,
      fontWeight: tokens.typography.fontWeight.semibold as any,
      color: tokens.colors.primary,
      lineHeight: tokens.typography.lineHeight.normal,
    },
    button: {
      ...tokens.shadows.ios, // iOS shadow
      elevation: tokens.shadows.android.elevation, // Android
    },
  })

  return <View style={styles.container}>...</View>
}
```

### In Web (CSS Classes)

```tsx
export function HomePage() {
  return (
    <div className="flex flex-col gap-4 p-5 max-w-lg">
      <h1 className="text-3xl font-bold text-primary">Welcome</h1>
      <p className="text-base text-secondary">Subheading</p>
      <button className="button-primary">Click me</button>
    </div>
  )
}
```

### CSS Custom Properties

```css
.my-element {
  background-color: var(--color-primary);
  padding: var(--spacing-4);
  font-size: var(--font-size-base);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
}
```

## Adding New Design Tokens

### Step 1: Add to tokens.ts

```tsx
// src/theme/tokens.ts
export const tokens = {
  colors: {
    // ... existing colors
    tertiary: '#a855f7', // NEW
  },
}
```

### Step 2: Update types.ts (Optional but recommended)

```tsx
export type ColorKey = keyof typeof tokens.colors
// ColorKey now includes 'tertiary'
```

### Step 3: Use in Components

**React Native:**
```tsx
const styles = StyleSheet.create({
  badge: {
    backgroundColor: tokens.colors.tertiary,
  },
})
```

**Web (CSS):**
```css
.badge {
  background-color: var(--color-tertiary);
}
```

The CSS variable is automatically generated and available in `globals.css`.

## Component Migration Checklist

When migrating an existing component to use tokens:

- [ ] Import `tokens` from `'@/src/theme/tokens'`
- [ ] Replace hardcoded color values with `tokens.colors.*`
- [ ] Replace hardcoded sizes with `tokens.spacing.*`
- [ ] Replace hardcoded font sizes with `tokens.typography.fontSize.*`
- [ ] Replace hardcoded font weights with `tokens.typography.fontWeight.*`
- [ ] Replace hardcoded border radius with `tokens.borderRadius.*`
- [ ] Replace hardcoded shadows with tokens.shadows or utility classes
- [ ] Test on both web (desktop, tablet, mobile) and mobile devices
- [ ] Verify colors, spacing, and typography match design system

## Responsive Design Pattern

### Mobile-First with Tokens

```tsx
import { useWindowDimensions } from 'react-native'
import { tokens } from '@/src/theme/tokens'

const ResponsiveComponent = () => {
  const { width } = useWindowDimensions()
  
  // Use tokens.breakpoints for consistency
  const padding = width >= tokens.breakpoints.desktop 
    ? tokens.spacing[7]  // 28px
    : width >= tokens.breakpoints.tablet 
    ? tokens.spacing[6]  // 24px
    : tokens.spacing[4]  // 16px
    
  const isMobileLayout = width < tokens.breakpoints.tablet
  
  return (
    <View style={{ padding }}>
      {isMobileLayout ? <MobileLayout /> : <DesktopLayout />}
    </View>
  )
}
```

### Media Queries for Web

```css
/* Mobile first (default styles) */
.container {
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
}

/* Tablet and up */
@media (min-width: 768px) {
  .container {
    padding: var(--spacing-6);
    flex-direction: row;
  }
}

/* Desktop and up */
@media (min-width: 1200px) {
  .container {
    padding: var(--spacing-7);
    max-width: 1200px;
  }
}
```

Or use utility functions:
```tsx
import { getMediaQuery } from '@/src/theme/utilities'

const CSS = `
  .container {
    padding: var(--spacing-4);
  }
  
  ${getMediaQuery('tablet')} {
    .container {
      padding: var(--spacing-6);
    }
  }
`
```

## Color System

### Primary Colors
**Primary**: `--color-primary` (`#0d9488`) - Main brand color
**Primary Light**: `--color-primaryLight` (`#e0f7f5`) - Light backgrounds
**Primary Lighter**: `--color-primaryLighter` (`#f0fdf9`) - Very light backgrounds
**Primary Dark**: `--color-primaryDark` (`#0a7368`) - Darker variant

### Secondary Colors
**Secondary**: `--color-secondary` (`#059669`) - Alternative action color
**Secondary Light**: `--color-secondaryLight` (`#d1f3ed`) - Light backgrounds
**Secondary Lighter**: `--color-secondaryLighter` (`#e8f5f1`) - Very light backgrounds

### Status Colors
**Error**: `--color-error` (`#dc2626`) - Red for errors
**Success**: `--color-success` (`#16a34a`) - Green for success
**Warning**: `--color-warning` (`#ea580c`) - Orange for warnings

### Neutral Colors
**Text**: `--color-text` (`#0f172a`) - Primary text
**Contrast**: `--color-contrast` (`#0f172a`) - High-contrast foreground for light backgrounds
**Contrast Inverse**: `--color-contrastInverse` (`#ffffff`) - Foreground for dark/colored backgrounds
**Text Secondary**: `--color-textSecondary` (`#4b5563`) - Secondary text
**Text Tertiary**: `--color-textTertiary` (`#9ca3af`) - Tertiary/disabled text
**Border**: `--color-border` (`#ccf0e8`) - Light teal borders
**Background**: `--color-background` (`#ffffff`) - White backgrounds
**Background Secondary**: `--color-backgroundSecondary` (`#f9fafb`) - Off-white
**Background Tertiary**: `--color-backgroundTertiary` (`#f3f4f6`) - Light gray

## Breakpoints

```tsx
tokens.breakpoints = {
  mobile: 320,         // Small phones
  mobileSm: 375,       // iPhone/Android
  mobileLg: 480,       // Larger phones
  tablet: 768,         // Tablets
  tabletLg: 1024,      // Large tablets
  desktop: 1200,       // Desktops
  desktopLg: 1400,     // Large desktops
}
```

## Common Patterns

### Centered Flex Container

```tsx
const styles = StyleSheet.create({
  centered: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: tokens.spacing[4],
  },
})
```

Or CSS class:
```html
<div class="flex-center gap-4">...</div>
```

### Card Component

```tsx
const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.background,
    borderRadius: tokens.borderRadius.md,
    padding: tokens.spacing[4],
    borderWidth: 1,
    borderColor: tokens.colors.border,
    shadowColor: tokens.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
})
```

Or CSS class:
```html
<div class="card">...</div>
```

### Button Styles

React Native:
```tsx
const styles = StyleSheet.create({
  button: {
    backgroundColor: tokens.colors.primary,
    paddingVertical: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[5],
    borderRadius: tokens.borderRadius.md,
    alignItems: 'center',
  },
})
```

Web CSS class:
```html
<button class="button-primary">Click me</button>
```

## Performance Tips

1. **Memoize Style Objects** - Use `useMemo` for complex style calculations
2. **Import Only What You Need** - Import specific tokens, not the whole theme
3. **Use CSS Classes Instead of Inline Styles (Web)** - Utilities are pre-computed
4. **Avoid Inline Calculations** - Pre-calculate derived values
5. **Use Platform-Specific Styling** - Avoid Platform.select() when possible

Example:
```tsx
import { useMemo } from 'react'
import { useWindowDimensions } from 'react-native'
import { tokens } from '@/src/theme/tokens'

const padding = useMemo(() => {
  const { width } = useWindowDimensions()
  return width >= tokens.breakpoints.desktop
    ? tokens.spacing[7]
    : tokens.spacing[4]
}, [])
```

## Troubleshooting

### Tokens Not Being Applied

1. Verify import path: `import { tokens } from '@/src/theme/tokens'`
2. Check tsconfig.json `baseUrl` setting for path aliases
3. Ensure CSS files are imported in `_layout.tsx` for web

### Inconsistent Styling Across Platforms

1. Verify tokens are being used (not hardcoded values)
2. Check shadow definitions match between iOS/Android
3. Test with `Platform.OS` checks if needed
4. Use theme utilities for platform-specific logic

### CSS Variables Not Available

1. Import globals.css before other stylesheets
2. Verify `:root` section exists in globals.css
3. Check browser console for CSS variable errors
4. Clear browser cache

## Next Steps

1. **Dark Mode** - Add dark theme token set
2. **Animation Tokens** - Expand transition/animation definitions
3. **Storybook** - Document components with theme variations
4. **Design System** - Publish design documentation

## Resources

- [Design Tokens](src/theme/tokens.ts)
- [Type Definitions](src/theme/types.ts)
- [Utilities](src/theme/utilities.ts)
- [Global Styles](src/styles/globals.css)
- [Utility Classes](src/styles/utilities.css)
