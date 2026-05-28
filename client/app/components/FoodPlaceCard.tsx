import { Link } from 'expo-router'
import { Pressable, StyleSheet, Text, useWindowDimensions, View, Image } from 'react-native'
import { Post } from '@/src/api/postService'
import { ImagePlaceholder } from '@/src/components/ImagePlaceholder'
import { tokens } from '@/src/theme/tokens'

interface FoodPlaceCardProps {
  post: Post
  isWideWeb?: boolean
  isMobile?: boolean
}

export default function FoodPlaceCard({ post, isWideWeb = false, isMobile = false }: FoodPlaceCardProps) {
  const { width } = useWindowDimensions()
  
  const cardStyle = StyleSheet.flatten([styles.card, isWideWeb && styles.cardWide])
  const cardImageStyle = StyleSheet.flatten([
    styles.cardImage,
    isWideWeb && styles.cardImageWide,
    isMobile && styles.cardImageMobile,
  ])

  const mealType = post.theme?.name || 'Yemek'
  const priceRange = post.theme?.name || 'Bilgisiz'

  return (
    <View style={cardStyle}>
      {/* Image */}
      <View style={cardImageStyle}>
        {post.imageUrls && post.imageUrls.length > 0 ? (
          <>
            <Image
              source={{ uri: post.imageUrls[0] }}
              style={styles.image}
              resizeMode="cover"
            />
            {post.imageUrls.length > 1 && (
              <View style={styles.imageCountBadge}>
                <Text style={styles.imageCountText}>+{post.imageUrls.length - 1}</Text>
              </View>
            )}
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>🍽️ Yemek Yeri</Text>
            </View>
          </>
        ) : (
          <ImagePlaceholder compact />
        )}
      </View>

      {/* Content */}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {post.title || post.description.substring(0, 40)}
        </Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {post.description}
        </Text>

        {/* Location */}
        {post.locations && post.locations.length > 0 && (
          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>
              📍 {post.locations[0].name || post.locations[0].address}
            </Text>
            {post.locations[0].city && (
              <Text style={styles.locationCity}>{post.locations[0].city}</Text>
            )}
          </View>
        )}

        {/* Meal Type & Price */}
        <View style={styles.infoRow}>
          <View style={styles.infoBadge}>
            <Text style={styles.infoBadgeLabel}>Yemek Türü</Text>
            <Text style={styles.infoBadgeValue}>{mealType}</Text>
          </View>
          <View style={[styles.infoBadge, styles.priceBadge]}>
            <Text style={styles.infoBadgeLabel}>Fiyat</Text>
            <Text style={styles.priceValue}>{priceRange}</Text>
          </View>
        </View>

        {/* Rating - Prominent */}
        <View style={styles.ratingContainerProminant}>
          {post.rating ? (
            <>
              <Text style={styles.ratingEmoji}>⭐</Text>
              <Text style={styles.ratingValueLarge}>{post.rating}</Text>
              <Text style={styles.ratingMax}>/5</Text>
            </>
          ) : (
            <Text style={styles.noRating}>Henüz puan yok</Text>
          )}
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>❤️</Text>
            <Text style={styles.statText}>{post.likesCount}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>💬</Text>
            <Text style={styles.statText}>{post.commentsCount}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{post.user?.username || 'Anonim'}</Text>
          </View>
        </View>

        {/* View Button */}
        <Link href={`/detay/${post.id}`} asChild>
          <Pressable style={styles.viewButton}>
            <Text style={styles.viewButtonText}>İncele →</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.background,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: tokens.colors.accentSecondary,
    shadowColor: tokens.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    backgroundColor: tokens.colors.shadow + 'B3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  imageCountText: {
    color: tokens.colors.background,
    fontSize: 12,
    fontWeight: '700',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: tokens.colors.accentSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    color: tokens.colors.background,
    fontSize: 12,
    fontWeight: '700',
  },
  cardBody: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: tokens.colors.contrast,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 13,
    color: tokens.colors.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  locationContainer: {
    backgroundColor: tokens.colors.accentLight,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    borderRadius: 6,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '700',
    color: tokens.colors.accentDark,
    marginBottom: 2,
  },
  locationCity: {
    fontSize: 11,
    color: tokens.colors.accentDark,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  infoBadge: {
    flex: 1,
    backgroundColor: tokens.colors.primaryLighter,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  priceBadge: {
    backgroundColor: tokens.colors.locationLight,
    borderColor: tokens.colors.locationLight,
  },
  infoBadgeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: tokens.colors.textSecondary,
  },
  infoBadgeValue: {
    fontSize: 13,
    fontWeight: '700',
    color: tokens.colors.contrast,
    marginTop: 2,
  },
  priceValue: {
    fontSize: 13,
    fontWeight: '700',
    color: tokens.colors.locationPrimary,
    marginTop: 2,
  },
  ratingContainerProminant: {
    backgroundColor: tokens.colors.accentLight,
    borderWidth: 2,
    borderColor: tokens.colors.accentSecondary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 10,
  },
  ratingEmoji: {
    fontSize: 20,
  },
  ratingValueLarge: {
    fontSize: 20,
    fontWeight: '800',
    color: tokens.colors.accentSecondary,
  },
  ratingMax: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.accentDark,
  },
  noRating: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.accentDark,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statEmoji: {
    fontSize: 14,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: tokens.colors.textSecondary,
  },
  userInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  userName: {
    fontSize: 12,
    fontWeight: '600',
    color: tokens.colors.textSecondary,
  },
  viewButton: {
    backgroundColor: tokens.colors.accentSecondary,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewButtonText: {
    color: tokens.colors.contrastInverse,
    fontSize: 13,
    fontWeight: '700',
  },
})
