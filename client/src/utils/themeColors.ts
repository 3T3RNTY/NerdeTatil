/**
 * Theme Color Utilities
 * Provides distinct color schemes for different post themes
 */

import { tokens } from '@/src/theme/tokens';

export interface ThemeColorScheme {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
}

/**
 * Theme-specific color schemes
 * Each theme gets a unique, visually distinctive color
 */
const THEME_COLOR_MAP: Record<string, ThemeColorScheme> = {
  // Culture & Heritage - Purple/Violet
  'Kültür & Miras': {
    backgroundColor: '#ede9fe', // violet-100
    textColor: '#6d28d9', // violet-700
    borderColor: '#7c3aed', // violet-600
  },
  // Food & Drinks - Orange/Red
  'Yeme & İçme': {
    backgroundColor: '#fed7aa', // orange-100
    textColor: '#b45309', // orange-700
    borderColor: '#d97706', // orange-600
  },
  // Nature & Outdoors - Green
  'Doğa & Açık Hava': {
    backgroundColor: '#dcfce7', // green-100
    textColor: '#15803d', // green-700
    borderColor: '#16a34a', // green-600
  },
  // Shopping & Markets - Pink
  'Alışveriş & Pazarlar': {
    backgroundColor: '#fce7f3', // pink-100
    textColor: '#9d174d', // pink-700
    borderColor: '#ec4899', // pink-600
  },
  // Accommodation & Hotels - Blue
  'Konaklama & Oteller': {
    backgroundColor: '#dbeafe', // blue-100
    textColor: '#1e40af', // blue-700
    borderColor: '#0284c7', // blue-600
  },
  // Entertainment & Nightlife - Indigo
  'Eğlence & Gece Hayatı': {
    backgroundColor: '#e0e7ff', // indigo-100
    textColor: '#3730a3', // indigo-700
    borderColor: '#4f46e5', // indigo-600
  },
  // Adventure & Sports - Cyan
  'Macera & Sporlar': {
    backgroundColor: '#cffafe', // cyan-100
    textColor: '#0e7490', // cyan-700
    borderColor: '#0891b2', // cyan-600
  },
  // Arts & Museums - Rose
  'Sanat & Müzeler': {
    backgroundColor: '#ffe4e6', // rose-100
    textColor: '#831843', // rose-700
    borderColor: '#f43f5e', // rose-600
  },
  // Travel - Teal
  'Seyahat': {
    backgroundColor: '#e0f7f5', // teal-100
    textColor: '#0a7368', // teal-700
    borderColor: '#0d9488', // teal-600
  },
  // Relaxation & Wellness - Emerald
  'Rahatlama & Sağlık': {
    backgroundColor: '#d1f3ed', // emerald-100
    textColor: '#065f46', // emerald-700
    borderColor: '#059669', // emerald-600
  },
};

/**
 * Default color scheme for unknown themes
 */
const DEFAULT_COLOR_SCHEME: ThemeColorScheme = {
  backgroundColor: tokens.colors.primaryLighter,
  textColor: tokens.colors.primary,
  borderColor: tokens.colors.primary,
};

/**
 * Get theme color scheme by theme name
 * @param themeName - The name of the theme (e.g., "Kültür & Miras")
 * @returns A ThemeColorScheme object with backgroundColor, textColor, and borderColor
 */
export function getThemeColorScheme(themeName: string): ThemeColorScheme {
  return THEME_COLOR_MAP[themeName] || DEFAULT_COLOR_SCHEME;
}

/**
 * Get all theme color schemes
 * @returns Array of all available theme color schemes
 */
export function getAllThemeColorSchemes(): Record<string, ThemeColorScheme> {
  return THEME_COLOR_MAP;
}
