import { Link } from 'expo-router'
import { Pressable, StyleSheet, Text, useWindowDimensions, View, Image } from 'react-native'
import { Post } from '@/src/api/postService'
import { ImagePlaceholder } from '@/src/components/ImagePlaceholder'

interface AttractionCardProps {
  post: Post
  isWideWeb?: boolean
  isMobile?: boolean
}

export default function AttractionCard({ post, isWideWeb = false, isMobile = false }: AttractionCardProps) {
  const { width } = useWindowDimensions()
  
  const cardStyle = StyleSheet.flatten([styles.card, isWideWeb && styles.cardWide])
  const cardImageStyle = StyleSheet.flatten([
    styles.cardImage,
    isWideWeb && styles.cardImageWide,
    isMobile && styles.cardImageMobile,
  ])

  // Get theme badge text - use new format if available
  const getThemeBadge = () => {
    if (post.theme?.emoji) {
      return `${post.theme.emoji} ${post.theme.name}`
    }
    return '🏛️ Sehenlik'
  }

  // Calculate average rating from multi-criteria ratings
  const getAverageRating = () => {
    if (!post.multiCriteriaRatings) return null
    const ratings = Object.values(post.multiCriteriaRatings).filter(r => r)
    if (ratings.length === 0) return null
    return (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
  }

  // Render stars based on rating
  const renderStars = (rating: number | string | null) => {
    if (!rating) return '★☆☆☆☆'
    const num = typeof rating === 'string' ? parseFloat(rating) : rating
    const filled = Math.round(num)
    return '★'.repeat(filled) + '☆'.repeat(5 - filled)
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
        <Text style={styles.cardDescription} numberOfLines={3}>
          {post.description}
        </Text>

        {/* Theme Info (New Format) */}
        {post.theme?.name && (
          <View style={styles.themeContainer}>
            <Text style={styles.themeLabel}>📂 Tema</Text>
            <Text style={styles.themeName}>{post.theme.name}</Text>
          </View>
        )}

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

        {/* Old-Format Rating */}
        {!post.multiCriteriaRatings && post.rating && (
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
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ec4899',
    shadowColor: '#000',
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
    backgroundColor: '#f3f4f6',
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
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#ec4899',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  cardBody: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f766e',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 18,
  },
  locationContainer: {
    backgroundColor: '#fce7f3',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    borderRadius: 6,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#831843',
    marginBottom: 2,
  },
  locationCity: {
    fontSize: 11,
    color: '#be185d',
  },
  themeContainer: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 3,
    borderLeftColor: '#0284c7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
    borderRadius: 4,
  },
  themeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0369a1',
    marginBottom: 2,
  },
  themeName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284c7',
  },
  multiRatingContainer: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
    color: '#6b7280',
    marginBottom: 2,
  },
  ratingStars: {
    fontSize: 12,
    color: '#fbbf24',
    letterSpacing: 1,
  },
  hoursContainer: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    borderRadius: 6,
  },
  hoursLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 2,
  },
  hoursValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#b45309',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fce7f3',
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
    color: '#831843',
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
    color: '#6b7280',
  },
  userInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  userName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  viewButton: {
    backgroundColor: '#ec4899',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
})
