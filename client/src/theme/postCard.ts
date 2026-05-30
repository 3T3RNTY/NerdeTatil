/**
 * Shared post card styles — unified look across Trip, Attraction, Hotel, Food cards
 */

import { StyleSheet } from 'react-native';
import { tokens } from './tokens';

export const postCardStyles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.borderRadius.md,
    overflow: 'hidden',
    marginBottom: tokens.spacing[3],
    borderWidth: 1,
    borderColor: tokens.colors.borderStrong,
    shadowColor: tokens.colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 4,
  },
  cardWide: {
    flex: 1,
    minWidth: '45%',
  },
  cardImage: {
    width: '100%',
    height: 200,
    backgroundColor: tokens.colors.backgroundTertiary,
    position: 'relative',
  },
  cardImageWide: {
    height: 180,
  },
  cardImageMobile: {
    height: 160,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageCountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  imageCountText: {
    color: tokens.colors.contrastInverse,
    fontSize: 12,
    fontWeight: '700',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: tokens.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: tokens.borderRadius.base,
    borderWidth: 1,
    borderColor: tokens.colors.primaryDark,
  },
  categoryBadgeText: {
    color: tokens.colors.contrastInverse,
    fontSize: 12,
    fontWeight: '700',
  },
  cardBody: {
    padding: tokens.spacing[3],
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: tokens.colors.text,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 13,
    color: tokens.colors.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  highlightBox: {
    backgroundColor: tokens.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderLeftWidth: 3,
    borderLeftColor: tokens.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    borderRadius: tokens.borderRadius.sm,
  },
  viewButton: {
    backgroundColor: tokens.colors.primary,
    paddingVertical: 10,
    borderRadius: tokens.borderRadius.base,
    alignItems: 'center',
  },
  viewButtonText: {
    color: tokens.colors.contrastInverse,
    fontSize: 13,
    fontWeight: '700',
  },
  ratingStars: {
    fontSize: 12,
    color: tokens.colors.star,
    letterSpacing: 1,
  },
});
