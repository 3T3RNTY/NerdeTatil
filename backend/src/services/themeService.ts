import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ThemeService {
  /**
   * Get all themes with their sub-themes
   */
  static async getAllThemes() {
    const themes = await prisma.theme.findMany({
      include: {
        subThemes: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return themes.map((theme) => ({
      id: theme.id,
      name: theme.name,
      emoji: theme.emoji,
      description: theme.description,
      subThemes: theme.subThemes,
    }));
  }

  /**
   * Get single theme by ID with sub-themes
   */
  static async getThemeById(themeId: string) {
    const theme = await prisma.theme.findUnique({
      where: { id: themeId },
      include: {
        subThemes: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!theme) {
      return null;
    }

    return {
      id: theme.id,
      name: theme.name,
      emoji: theme.emoji,
      description: theme.description,
      subThemes: theme.subThemes,
    };
  }

  /**
   * Validate that all subThemeIds belong to the given themeId
   */
  static async validateSubThemes(themeId: string, subThemeIds: string[]) {
    if (!Array.isArray(subThemeIds) || subThemeIds.length === 0) {
      throw new Error('At least one sub-theme must be selected');
    }

    const theme = await prisma.theme.findUnique({
      where: { id: themeId },
      include: {
        subThemes: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!theme) {
      throw new Error('Theme not found');
    }

    const validSubThemeIds = new Set(theme.subThemes.map((st) => st.id));
    for (const subThemeId of subThemeIds) {
      if (!validSubThemeIds.has(subThemeId)) {
        throw new Error(`Sub-theme ${subThemeId} does not belong to theme ${themeId}`);
      }
    }

    return true;
  }
}
