/**
 * Tag color utilities — brand-consistent chip rotation
 */

import { tokens } from '@/src/theme/tokens';

export interface TagColorScheme {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
}

const TAG_COLOR_SCHEMES: TagColorScheme[] = [
  {
    backgroundColor: tokens.colors.primaryLighter,
    textColor: tokens.colors.primaryDark,
    borderColor: tokens.colors.primary,
  },
  {
    backgroundColor: tokens.colors.secondaryLighter,
    textColor: tokens.colors.secondary,
    borderColor: tokens.colors.secondary,
  },
  {
    backgroundColor: tokens.colors.infoLight,
    textColor: tokens.colors.infoDark,
    borderColor: tokens.colors.infoPrimary,
  },
  {
    backgroundColor: tokens.colors.surfaceMuted,
    textColor: tokens.colors.primaryDark,
    borderColor: tokens.colors.border,
  },
  {
    backgroundColor: tokens.colors.accentLight,
    textColor: tokens.colors.accentDark,
    borderColor: tokens.colors.accent,
  },
];

export function getTagColorScheme(index: number): TagColorScheme {
  return TAG_COLOR_SCHEMES[index % TAG_COLOR_SCHEMES.length];
}

export function getTagColorSchemeByHash(value: string): TagColorScheme {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return TAG_COLOR_SCHEMES[Math.abs(hash) % TAG_COLOR_SCHEMES.length];
}
