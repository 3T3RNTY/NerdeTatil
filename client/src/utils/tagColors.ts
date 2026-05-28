/**
 * Tag Color Utilities
 * Provides rotating color schemes for tags/chips to enhance visual distinction
 */

import { tokens } from '@/src/theme/tokens';

export interface TagColorScheme {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
}

/**
 * Color scheme rotation for tags
 * Each scheme uses a different color from the theme palette
 */
const TAG_COLOR_SCHEMES: TagColorScheme[] = [
  {
    backgroundColor: tokens.colors.primaryLighter,
    textColor: tokens.colors.primary,
    borderColor: tokens.colors.primary,
  },
  {
    backgroundColor: tokens.colors.secondaryLighter,
    textColor: tokens.colors.secondary,
    borderColor: tokens.colors.secondary,
  },
  {
    backgroundColor: tokens.colors.accentLight,
    textColor: tokens.colors.accent,
    borderColor: tokens.colors.accent,
  },
  {
    backgroundColor: tokens.colors.locationLight,
    textColor: tokens.colors.locationPrimary,
    borderColor: tokens.colors.locationPrimary,
  },
  {
    backgroundColor: tokens.colors.infoLight,
    textColor: tokens.colors.infoPrimary,
    borderColor: tokens.colors.infoPrimary,
  },
  {
    backgroundColor: tokens.colors.successLight,
    textColor: tokens.colors.success,
    borderColor: tokens.colors.success,
  },
  {
    backgroundColor: tokens.colors.warningLight,
    textColor: tokens.colors.warning,
    borderColor: tokens.colors.warning,
  },
  {
    backgroundColor: tokens.colors.errorLight,
    textColor: tokens.colors.error,
    borderColor: tokens.colors.error,
  },
];

/**
 * Get a color scheme for a tag based on its index or name
 * @param index - The index to rotate through color schemes
 * @returns A TagColorScheme object with backgroundColor, textColor, and borderColor
 */
export function getTagColorScheme(index: number): TagColorScheme {
  return TAG_COLOR_SCHEMES[index % TAG_COLOR_SCHEMES.length];
}

/**
 * Get color scheme based on string (for consistent colors per tag)
 * Useful when you want the same tag to always have the same color
 * @param value - The string value to hash
 * @returns A TagColorScheme object
 */
export function getTagColorSchemeByHash(value: string): TagColorScheme {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return TAG_COLOR_SCHEMES[Math.abs(hash) % TAG_COLOR_SCHEMES.length];
}
