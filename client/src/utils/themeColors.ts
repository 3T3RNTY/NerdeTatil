/**
 * Theme color utilities — teal-family variations only (no rainbow per-category colors)
 */

import { tokens } from '@/src/theme/tokens';

export interface ThemeColorScheme {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
}

/** Subtle teal/emerald variations for category distinction */
const TEAL_SCHEMES: ThemeColorScheme[] = [
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
    textColor: tokens.colors.primaryDark,
    borderColor: tokens.colors.primary,
  },
  {
    backgroundColor: tokens.colors.primaryLight,
    textColor: tokens.colors.primaryDark,
    borderColor: tokens.colors.primaryDark,
  },
  {
    backgroundColor: tokens.colors.surfaceMuted,
    textColor: tokens.colors.secondary,
    borderColor: tokens.colors.secondary,
  },
];

const THEME_INDEX: Record<string, number> = {
  'Kültür & Miras': 0,
  'Yeme & İçme': 1,
  'Doğa & Açık Hava': 2,
  'Alışveriş & Pazarlar': 3,
  'Konaklama & Oteller': 4,
  'Eğlence & Gece Hayatı': 0,
  'Macera & Sporlar': 2,
  'Sanat & Müzeler': 1,
  Seyahat: 0,
  'Rahatlama & Sağlık': 4,
};

const DEFAULT_SCHEME: ThemeColorScheme = TEAL_SCHEMES[0];

function hashThemeName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getThemeColorScheme(themeName: string): ThemeColorScheme {
  const index = THEME_INDEX[themeName];
  if (index !== undefined) {
    return TEAL_SCHEMES[index % TEAL_SCHEMES.length];
  }
  return TEAL_SCHEMES[hashThemeName(themeName) % TEAL_SCHEMES.length] ?? DEFAULT_SCHEME;
}

export function getAllThemeColorSchemes(): Record<string, ThemeColorScheme> {
  const result: Record<string, ThemeColorScheme> = {};
  for (const [name, index] of Object.entries(THEME_INDEX)) {
    result[name] = TEAL_SCHEMES[index % TEAL_SCHEMES.length];
  }
  return result;
}
