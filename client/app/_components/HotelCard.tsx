import { Link } from 'expo-router'
import { Pressable, StyleSheet, Text, useWindowDimensions, View, Image } from 'react-native'
import { Post } from '@/src/api/postService'
import { ImagePlaceholder } from '@/src/components/ImagePlaceholder'
import { tokens } from '@/src/theme/tokens'
import { postCardStyles } from '@/src/theme/postCard'

interface HotelCardProps {
  post: Post
  isWideWeb?: boolean
  isMobile?: boolean
}

export default function HotelCard({ post, isWideWeb = false, isMobile = false }: HotelCardProps) {
  const { width } = useWindowDimensions()
  
  const cardStyle = StyleSheet.flatten([postCardStyles.card, isWideWeb && postCardStyles.cardWide])
  const cardImageStyle = StyleSheet.flatten([
    postCardStyles.cardImage,
    isWideWeb && postCardStyles.cardImageWide,
    isMobile && postCardStyles.cardImageMobile,
  ])

  const priceRange = post.theme?.name || 'Bilgisiz'
  const amenities: string[] = []

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
              <Text style={postCardStyles.categoryBadgeText}>🏨 Otel</Text>
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

        {/* Price Range */}
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Fiyat Aralığı</Text>
          <Text style={styles.priceValue}>{priceRange}</Text>
        </View>

        {/* Amenities */}
        {amenities.length > 0 && (
          <View style={styles.amenitiesContainer}>
            <Text style={styles.amenitiesTitle}>Olanaklar:</Text>
            <View style={styles.amenitiesList}>
              {amenities.slice(0, 3).map((amenity, idx) => (
                <View key={idx} style={styles.amenityBadge}>
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
              {amenities.length > 3 && (
                <View style={styles.amenityBadge}>
                  <Text style={styles.amenityText}>+{amenities.length - 3}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Rating */}
        {post.rating && (
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingEmoji}>⭐</Text>
            <Text style={styles.ratingText}>{post.rating}/5</Text>
          </View>
        )}

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
  cardDescription: {
    fontSize: 13,
    color: tokens.colors.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  locationContainer: {
    backgroundColor: tokens.colors.primaryLighter,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    borderRadius: 6,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '700',
    color: tokens.colors.infoDark,
    marginBottom: 2,
  },
  locationCity: {
    fontSize: 11,
    color: tokens.colors.infoDark,
  },
  priceContainer: {
    backgroundColor: tokens.colors.locationLight,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    borderRadius: 6,
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: tokens.colors.locationDark,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '700',
    color: tokens.colors.locationPrimary,
    marginTop: 2,
  },
  amenitiesContainer: {
    marginBottom: 8,
  },
  amenitiesTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: tokens.colors.infoDark,
    marginBottom: 6,
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  amenityBadge: {
    backgroundColor: tokens.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  amenityText: {
    fontSize: 11,
    fontWeight: '600',
    color: tokens.colors.infoDark,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: tokens.colors.locationLight,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  ratingEmoji: {
    fontSize: 14,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: tokens.colors.locationDark,
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
