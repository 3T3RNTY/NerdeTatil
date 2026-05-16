/**
 * Theme Utilities
 * Helper functions to generate CSS custom properties for web and StyleSheet objects for mobile
 */

import { tokens } from './tokens';
import { CSSVariables, NativeStyles, SpacingKey, ColorKey } from './types';

/**
 * Generate CSS custom properties from design tokens for web
 * Usage: Add the result to a CSS file or inject into DOM
 * Example: const cssVars = generateCSSVariables();
 */
export function generateCSSVariables(): string {
  let cssString = ':root {\n';

  // Colors
  Object.entries(tokens.colors).forEach(([key, value]) => {
    cssString += `  --color-${key}: ${value};\n`;
  });

  // Typography
  Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
    cssString += `  --font-size-${key}: ${value}px;\n`;
  });

  Object.entries(tokens.typography.fontWeight).forEach(([key, value]) => {
    cssString += `  --font-weight-${key}: ${value};\n`;
  });

  Object.entries(tokens.typography.lineHeight).forEach(([key, value]) => {
    cssString += `  --line-height-${key}: ${value};\n`;
  });

  // Spacing
  Object.entries(tokens.spacing).forEach(([key, value]) => {
    cssString += `  --spacing-${key}: ${value}px;\n`;
  });

  // Border radius
  Object.entries(tokens.borderRadius).forEach(([key, value]) => {
    cssString += `  --border-radius-${key}: ${value}px;\n`;
  });

  // Shadows
  Object.entries(tokens.shadows).forEach(([key, value]) => {
    if (typeof value === 'string' && !key.includes('android') && !key.includes('ios')) {
      cssString += `  --shadow-${key}: ${value};\n`;
    }
  });

  // Breakpoints
  Object.entries(tokens.breakpoints).forEach(([key, value]) => {
    cssString += `  --breakpoint-${key}: ${value}px;\n`;
  });

  // Z-index
  Object.entries(tokens.zIndex).forEach(([key, value]) => {
    if (typeof value === 'number') {
      cssString += `  --z-index-${key}: ${value};\n`;
    }
  });

  // Transitions
  Object.entries(tokens.transition.duration).forEach(([key, value]) => {
    cssString += `  --transition-duration-${key}: ${value}ms;\n`;
  });

  cssString += '}\n';
  return cssString;
}

/**
 * Get a CSS custom property variable name
 * Usage: getCSSVariable('primary') => 'var(--color-primary)'
 */
export function getCSSVariable(
  category: 'color' | 'spacing' | 'fontSize' | 'fontWeight' | 'borderRadius' | 'shadow' | 'breakpoint' | 'zIndex' | 'transitionDuration',
  key: string,
): string {
  return `var(--${category}-${key})`;
}

/**
 * Generate React Native StyleSheet object from design tokens
 * Maps web-style CSS tokens to React Native compatible styles
 */
export function generateNativeStyleSheet(): NativeStyles {
  return {
    // Common layout utilities
    flexContainer: {
      display: 'flex',
    },
    flexRowCenter: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    flexRowBetween: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    flexColCenter: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },

    // Cards and containers
    card: {
      backgroundColor: tokens.colors.background,
      borderRadius: tokens.borderRadius.md,
      padding: tokens.spacing[4],
      borderColor: tokens.colors.border,
      borderWidth: 1,
    },
    cardWide: {
      backgroundColor: tokens.colors.background,
      borderRadius: tokens.borderRadius.lg,
      padding: tokens.spacing[5],
      borderColor: tokens.colors.border,
      borderWidth: 1,
    },
    shadow: {
      shadowColor: tokens.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    shadowMd: {
      shadowColor: tokens.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 6,
    },

    // Typography
    heading1: {
      fontSize: tokens.typography.fontSize['4xl'],
      fontWeight: tokens.typography.fontWeight.bold,
      lineHeight: tokens.typography.lineHeight.tight,
      color: tokens.colors.text,
    },
    heading2: {
      fontSize: tokens.typography.fontSize['3xl'],
      fontWeight: tokens.typography.fontWeight.bold,
      lineHeight: tokens.typography.lineHeight.tight,
      color: tokens.colors.text,
    },
    heading3: {
      fontSize: tokens.typography.fontSize['2xl'],
      fontWeight: tokens.typography.fontWeight.semibold,
      lineHeight: tokens.typography.lineHeight.normal,
      color: tokens.colors.text,
    },
    body: {
      fontSize: tokens.typography.fontSize.base,
      fontWeight: tokens.typography.fontWeight.normal,
      lineHeight: tokens.typography.lineHeight.normal,
      color: tokens.colors.text,
    },
    bodySmall: {
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.normal,
      lineHeight: tokens.typography.lineHeight.normal,
      color: tokens.colors.textSecondary,
    },

    // Buttons
    buttonPrimary: {
      backgroundColor: tokens.colors.primary,
      paddingVertical: tokens.spacing[3],
      paddingHorizontal: tokens.spacing[5],
      borderRadius: tokens.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonSecondary: {
      backgroundColor: tokens.colors.secondary,
      paddingVertical: tokens.spacing[3],
      paddingHorizontal: tokens.spacing[5],
      borderRadius: tokens.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonOutline: {
      borderColor: tokens.colors.border,
      borderWidth: 1,
      paddingVertical: tokens.spacing[3],
      paddingHorizontal: tokens.spacing[5],
      borderRadius: tokens.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Inputs
    input: {
      borderColor: tokens.colors.border,
      borderWidth: 1,
      borderRadius: tokens.borderRadius.md,
      paddingVertical: tokens.spacing[3],
      paddingHorizontal: tokens.spacing[4],
      fontSize: tokens.typography.fontSize.base,
      color: tokens.colors.text,
    },
    inputError: {
      borderColor: tokens.colors.error,
    },
    inputFocused: {
      borderColor: tokens.colors.primary,
    },

    // Text
    textPrimary: {
      color: tokens.colors.text,
    },
    textSecondary: {
      color: tokens.colors.textSecondary,
    },
    textTertiary: {
      color: tokens.colors.textTertiary,
    },
    textError: {
      color: tokens.colors.error,
    },
  };
}

/**
 * Get a color value from the theme with optional opacity
 * Usage: getColor('primary') => '#0d9488', getColor('primary', 0.5) => 'rgba(13, 148, 136, 0.5)'
 */
export function getColor(key: ColorKey, opacity?: number): string {
  const color = tokens.colors[key];
  if (!opacity || opacity === 1) {
    return color;
  }

  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Get spacing value
 * Usage: getSpacing(4) => 16
 */
export function getSpacing(key: SpacingKey): number {
  return tokens.spacing[key];
}

/**
 * Generate media query string for responsive design
 * Usage: getMediaQuery('tablet') => '@media (min-width: 768px)'
 */
export function getMediaQuery(breakpoint: keyof typeof tokens.breakpoints): string {
  return `@media (min-width: ${tokens.breakpoints[breakpoint]}px)`;
}

/**
 * Responsive padding/margin helper
 * Usage: getResponsiveSpacing(4, 5, 6) => { base: '16px', tablet: '20px', desktop: '24px' }
 */
export function getResponsiveSpacing(
  base: SpacingKey,
  tablet?: SpacingKey,
  desktop?: SpacingKey,
): { base: string; tablet?: string; desktop?: string } {
  return {
    base: `${tokens.spacing[base]}px`,
    ...(tablet && { tablet: `${tokens.spacing[tablet]}px` }),
    ...(desktop && { desktop: `${tokens.spacing[desktop]}px` }),
  };
}

/**
 * Utility to check if we're on mobile based on window size
 * Usage: isMobileViewport(windowWidth) => boolean
 */
export function isMobileViewport(windowWidth: number): boolean {
  return windowWidth < tokens.breakpoints.tablet;
}

/**
 * Utility to check if we're on tablet
 * Usage: isTabletViewport(windowWidth) => boolean
 */
export function isTabletViewport(windowWidth: number): boolean {
  return windowWidth >= tokens.breakpoints.tablet && windowWidth < tokens.breakpoints.desktop;
}

/**
 * Utility to check if we're on desktop
 * Usage: isDesktopViewport(windowWidth) => boolean
 */
export function isDesktopViewport(windowWidth: number): boolean {
  return windowWidth >= tokens.breakpoints.desktop;
}

/**
 * Export all tokens for direct access
 */
export { tokens };
