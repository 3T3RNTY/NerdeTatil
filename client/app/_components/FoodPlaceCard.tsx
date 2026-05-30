import { Link } from 'expo-router'
import { Pressable, StyleSheet, Text, useWindowDimensions, View, Image } from 'react-native'
import { Post } from '@/src/api/postService'
import { ImagePlaceholder } from '@/src/components/ImagePlaceholder'
import { tokens } from '@/src/theme/tokens'
import { postCardStyles } from '@/src/theme/postCard'

interface FoodPlaceCardProps {
  post: Post
  isWideWeb?: boolean
  isMobile?: boolean
}

export default function FoodPlaceCard({ post, isWideWeb = false, isMobile = false }: FoodPlaceCardProps) {
  const { width } = useWindowDimensions()
  
  const cardStyle = StyleSheet.flatten([postCardStyles.card, isWideWeb && postCardStyles.cardWide])
  const cardImageStyle = StyleSheet.flatten([
    postCardStyles.cardImage,
    isWideWeb && postCardStyles.cardImageWide,
    isMobile && postCardStyles.cardImageMobile,
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
              <View style={postCardStyles.imageCountBadge}>
                <Text style={postCardStyles.imageCountText}>+{post.imageUrls.length - 1}</Text>
              </View>
            )}
            <View style={postCardStyles.categoryBadge}>
              <Text style={postCardStyles.categoryBadgeText}>🍽️ Yemek Yeri</Text>
            </View>
          </>
        ) : (
          <ImagePlaceholder compact />
        )}
      </View>

      {/* Content */}
      <View style={postCardStyles.cardBody}>
        <Text style={postCardStyles.cardTitle} numberOfLines={2}>
          {post.title || post.description.substring(0, 40)}
        </Text>
        <Text style={postCardStyles.cardDescription} numberOfLines={2}>
          {post.description}
        </Text>

        {/* Location */}
        {post.locations && post.locations.length > 0 && (
          <View style={postCardStyles.highlightBox}>
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
          <Pressable style={postCardStyles.viewButton}>
            <Text style={postCardStyles.viewButtonText}>İncele →</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  locationText: {
    fontSize: 13,
    fontWeight: '700',
    color: tokens.colors.text,
    marginBottom: 2,
  },
  locationCity: {
    fontSize: 11,
    color: tokens.colors.primary,
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
    backgroundColor: tokens.colors.surfaceMuted,
    borderColor: tokens.colors.border,
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
    color: tokens.colors.primary,
    marginTop: 2,
  },
  ratingContainerProminant: {
    backgroundColor: tokens.colors.accentLight,
    borderWidth: 1,
    borderColor: tokens.colors.accent,
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
    color: tokens.colors.star,
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
})
