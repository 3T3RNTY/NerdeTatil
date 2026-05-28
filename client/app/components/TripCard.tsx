import { Link } from 'expo-router'
import { Pressable, StyleSheet, Text, useWindowDimensions, View, Image, Platform } from 'react-native'
import { Post } from '@/src/api/postService'
import { ImagePlaceholder } from '@/src/components/ImagePlaceholder'
import { tokens } from '@/src/theme/tokens'

interface TripCardProps {
  post: Post
  isWideWeb?: boolean
  isMobile?: boolean
}

export default function TripCard({ post, isWideWeb = false, isMobile = false }: TripCardProps) {
  const { width } = useWindowDimensions()
  
  const cardStyle = StyleSheet.flatten([styles.card, isWideWeb && styles.cardWide])
  const cardImageStyle = StyleSheet.flatten([
    styles.cardImage,
    isWideWeb && styles.cardImageWide,
    isMobile && styles.cardImageMobile,
  ])

  // Format date range
  const formatDateRange = () => {
    if (!post.startDate && !post.endDate) return 'Tarihleri belirtilmedi'
    if (post.startDate && post.endDate) {
      const start = new Date(post.startDate).toLocaleDateString('tr-TR')
      const end = new Date(post.endDate).toLocaleDateString('tr-TR')
      return `${start} - ${end}`
    }
    if (post.startDate) return `${new Date(post.startDate).toLocaleDateString('tr-TR')} başlangıç`
    return `${new Date(post.endDate!).toLocaleDateString('tr-TR')} bitiş`
  }

  // Calculate average rating from multi-criteria ratings
  const getAverageRating = () => {
    if (!post.multiCriteriaRatings) return null
    const ratings = Object.values(post.multiCriteriaRatings).filter(r => r)
    if (ratings.length === 0) return null
    return (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
  }

  // Render stars based on rating
  const renderStars = (rating: number | string | null | undefined) => {
    if (rating == null) return '★☆☆☆☆'
    const num = typeof rating === 'string' ? parseFloat(rating) : rating
    if (typeof num !== 'number' || isNaN(num)) return '★☆☆☆☆'
    const filled = Math.max(0, Math.min(5, Math.round(num)))
    return '★'.repeat(filled) + '☆'.repeat(5 - filled)
  }

  // Get theme badge text - use new format if available
  const getThemeBadge = () => {
    if (post.theme?.emoji) {
      return `${post.theme.emoji} ${post.theme.name}`
    }
    return '✈️ Seyahat'
  }

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
              <Text style={styles.categoryBadgeText}>{getThemeBadge()}</Text>
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

        {/* Locations */}
        {post.locations && post.locations.length > 0 && (
          <View style={styles.locationsContainer}>
            <Text style={styles.locationsTitle}>📍 Konumlar ({post.locations.length}):</Text>
            {post.locations.slice(0, 3).map((loc, idx) => (
              <Text key={idx} style={styles.locationItem}>
                • {loc.name || loc.address}
                {loc.visitDate && ` - ${new Date(loc.visitDate).toLocaleDateString('tr-TR')}`}
              </Text>
            ))}
            {post.locations.length > 3 && (
              <Text style={styles.moreLocations}>+{post.locations.length - 3} daha...</Text>
            )}
          </View>
        )}

        {/* Multi-Criteria Ratings (New Format) */}
        {post.multiCriteriaRatings && (
          <View style={styles.multiRatingContainer}>
            <View style={styles.ratingRow}>
              <View style={styles.ratingCol}>
                <Text style={styles.ratingLabel}>Çeşitlilik</Text>
                <Text style={styles.ratingStars}>{renderStars(post.multiCriteriaRatings.optionVariety)}</Text>
              </View>
              <View style={styles.ratingCol}>
                <Text style={styles.ratingLabel}>Konum</Text>
                <Text style={styles.ratingStars}>{renderStars(post.multiCriteriaRatings.location)}</Text>
              </View>
            </View>
            <View style={styles.ratingRow}>
              <View style={styles.ratingCol}>
                <Text style={styles.ratingLabel}>Erişim</Text>
                <Text style={styles.ratingStars}>{renderStars(post.multiCriteriaRatings.accessibility)}</Text>
              </View>
              <View style={styles.ratingCol}>
                <Text style={styles.ratingLabel}>Fiyat</Text>
                <Text style={styles.ratingStars}>{renderStars(post.multiCriteriaRatings.priceValue)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Old-Format Date Range */}
        {post.startDate && (
          <View style={styles.dateRangeContainer}>
            <Text style={styles.dateRangeLabel}>📅 {formatDateRange()}</Text>
          </View>
        )}

        {/* Old-Format Rating */}
        {!post.multiCriteriaRatings && post.rating && (
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingEmoji}>★</Text>
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
    backgroundColor: 'rgba(2, 132, 199, 0.08)',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0284c7',
    borderTopWidth: 2,
    borderTopColor: '#0284c7',
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
    backgroundColor: '#0284c7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: tokens.colors.background,
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
  locationsContainer: {
    backgroundColor: tokens.colors.primaryLighter,
    borderLeftWidth: 3,
    borderLeftColor: tokens.colors.infoPrimary,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    borderRadius: 4,
  },
  locationsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: tokens.colors.contrast,
    marginBottom: 4,
  },
  locationItem: {
    fontSize: 11,
    color: tokens.colors.text,
    marginBottom: 2,
  },
  moreLocations: {
    fontSize: 11,
    color: tokens.colors.infoPrimary,
    fontWeight: '600',
    marginTop: 2,
  },
  multiRatingContainer: {
    backgroundColor: tokens.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: tokens.colors.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    borderRadius: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  ratingCol: {
    flex: 1,
    marginRight: 6,
  },
  ratingLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: tokens.colors.textSecondary,
    marginBottom: 2,
  },
  ratingStars: {
    fontSize: 12,
    color: tokens.colors.accent,
    letterSpacing: 1,
  },
  dateRangeContainer: {
    backgroundColor: tokens.colors.backgroundSecondary,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  dateRangeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: tokens.colors.infoDark,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: tokens.colors.accentLight,
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
    backgroundColor: '#0284c7',
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
