/**
 * Design Tokens
 * Centralized theme tokens for both web (CSS) and mobile (React Native StyleSheet)
 * All colors, typography, spacing, shadows, and breakpoints are defined here
 */

export const tokens = {
  // Color Palette
  colors: {
    // Primary Brand Colors
    primary: '#0d9488', // teal-600
    primaryLight: '#e0f7f5', // light teal background
    primaryLighter: '#f0fdf9', // very light teal
    primaryDark: '#0a7368', // darker teal

    // Secondary Colors
    secondary: '#059669', // green-600
    secondaryLight: '#d1f3ed', // light green
    secondaryLighter: '#e8f5f1', // very light green

    // Accent/Status Colors
    error: '#dc2626', // red-600
    errorLight: '#fee2e2', // light red
    success: '#16a34a', // green-600
    successLight: '#dcfce7', // light green
    warning: '#ea580c', // orange-600
    warningLight: '#fed7aa', // light orange

    // Neutral Colors
    text: '#0f172a', // dark blue-gray
    textSecondary: '#4b5563', // medium gray
    textTertiary: '#9ca3af', // light gray
    border: '#ccf0e8', // light teal for borders
    borderLight: '#dbeafe', // very light blue
    background: '#ffffff', // white
    backgroundSecondary: '#f9fafb', // off-white
    backgroundTertiary: '#f3f4f6', // light gray
    shadow: '#000000', // for shadow color (alpha applied separately)
  },

  // Typography
  typography: {
    // Font families
    fontFamily: {
      base: 'system-ui, -apple-system, sans-serif',
      mono: '"Courier New", monospace',
    },

    // Font sizes (in pixels)
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
    },

    // Font weights
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },

    // Line heights
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },

    // Letter spacing
    letterSpacing: {
      tight: -0.5,
      normal: 0,
      wide: 0.5,
    },
  },

  // Spacing (for padding, margin, gaps)
  spacing: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    12: 48,
    14: 56,
    16: 64,
  },

  // Border Radius
  borderRadius: {
    none: 0,
    sm: 4,
    base: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    full: 9999,
  },

  // Shadows (for web CSS and React Native)
  shadows: {
    none: 'none',
    // Web CSS shadows
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

    // React Native shadows (platform-specific)
    android: {
      elevation: 4,
    },
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
  },

  // Responsive Breakpoints
  breakpoints: {
    // Mobile-first approach
    mobile: 320,
    mobileSm: 375,
    mobileLg: 480,
    tablet: 768,
    tabletLg: 1024,
    desktop: 1200,
    desktopLg: 1400,
  },

  // Z-index scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  // Transitions/Animations
  transition: {
    duration: {
      fast: 150,
      base: 200,
      slow: 300,
      slower: 500,
    },
    timingFunction: {
      linear: 'linear',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },
} as const;

export type Tokens = typeof tokens;
