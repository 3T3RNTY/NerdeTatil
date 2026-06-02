/**
 * Design Tokens
 * Centralized theme tokens for both web (CSS) and mobile (React Native StyleSheet)
 */

export const tokens = {
  colors: {
    // Brand — teal
    primary: '#0d9488',
    primaryLight: '#9fd4c8',
    primaryLighter: '#e4f0ec',
    primaryDark: '#085e55',

    // Navigation bar (turquoise/teal band)
    navBar: '#0d9488',
    navBarDark: '#085e55',
    navBarForeground: '#ffffff',
    navBarMuted: 'rgba(255, 255, 255, 0.88)',

    // Supporting green-teal
    secondary: '#0f766e',
    secondaryLight: '#7ec9bc',
    secondaryLighter: '#d4e8e3',

    // Surfaces & page (wider steps = more contrast, less "washed out")
    pageBackground: '#c5dbd4',
    /** Darker strip behind elevated cards (foreground/background separation) */
    panel: '#aec9c1',
    surface: '#ffffff',
    surfaceMuted: '#dce9e5',
    /** Inset well inside white cards (description blocks) */
    surfaceInset: '#f0f7f5',

    // Status
    error: '#dc2626',
    errorLight: '#fee2e2',
    success: '#16a34a',
    successLight: '#dcfce7',
    warning: '#ea580c',
    warningLight: '#fed7aa',

    // Accent — ratings & highlights (warm amber, not competing blues/pinks)
    accent: '#d97706',
    accentLight: '#fef3e2',
    accentDark: '#b45309',
    accentSecondary: '#e8952a',
    star: '#e8952a',

    // Semantic aliases (teal-based; kept for existing component references)
    locationPrimary: '#0f766e',
    locationLight: '#dce9e5',
    locationDark: '#085e55',
    infoPrimary: '#0d9488',
    infoLight: '#dce9e5',
    infoDark: '#085e55',

    overlay: '#0f172a',
    overlayScrim: 'rgba(15, 23, 42, 0.62)',

    // Neutrals
    text: '#0c1222',
    contrast: '#0c1222',
    contrastInverse: '#ffffff',
    textSecondary: '#334155',
    textTertiary: '#64748b',
    border: '#8fbdb3',
    borderLight: '#a8cfc6',
    borderStrong: '#6a9e92',
    background: '#ffffff',
    backgroundSecondary: '#dce9e5',
    backgroundTertiary: '#c5dbd4',
    shadow: '#0f172a',
  },

  typography: {
    fontFamily: {
      base: 'system-ui, -apple-system, sans-serif',
      mono: '"Courier New", monospace',
    },
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
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
    letterSpacing: {
      tight: -0.5,
      normal: 0,
      wide: 0.5,
    },
  },

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

  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(15, 23, 42, 0.08)',
    base: '0 1px 3px 0 rgba(15, 23, 42, 0.12), 0 1px 2px 0 rgba(15, 23, 42, 0.06)',
    md: '0 4px 14px -2px rgba(15, 23, 42, 0.14), 0 2px 6px -2px rgba(15, 23, 42, 0.08)',
    lg: '0 10px 28px -4px rgba(15, 23, 42, 0.16), 0 4px 12px -4px rgba(15, 23, 42, 0.1)',
    xl: '0 20px 36px -8px rgba(15, 23, 42, 0.2), 0 8px 16px -6px rgba(15, 23, 42, 0.12)',
    '2xl': '0 25px 50px -12px rgba(15, 23, 42, 0.28)',
    card: '0 4px 16px -2px rgba(15, 23, 42, 0.14), 0 2px 8px -2px rgba(15, 23, 42, 0.1)',
    android: {
      elevation: 4,
    },
    ios: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.16,
      shadowRadius: 10,
    },
  },

  breakpoints: {
    mobile: 320,
    mobileSm: 375,
    mobileLg: 480,
    tablet: 768,
    tabletLg: 1024,
    desktop: 1200,
    desktopLg: 1400,
  },

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
