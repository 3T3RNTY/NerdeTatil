import { Link } from 'expo-router'
import { Pressable, StyleSheet, Text, useWindowDimensions, View, Image, Platform } from 'react-native'
import { Post } from '@/src/api/postService'
import { ImagePlaceholder } from '@/src/components/ImagePlaceholder'

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
              <Text style={styles.categoryBadgeText}>✈️ Seyahat</Text>
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

        {/* Date Range */}
        <View style={styles.dateRangeContainer}>
          <Text style={styles.dateRangeLabel}>📅 {formatDateRange()}</Text>
        </View>

        {/* Rating */}
        {post.rating && (
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
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
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
    backgroundColor: '#3b82f6',
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
  locationsContainer: {
    backgroundColor: '#f0fdf9',
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    borderRadius: 4,
  },
  locationsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f766e',
    marginBottom: 4,
  },
  locationItem: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 2,
  },
  moreLocations: {
    fontSize: 11,
    color: '#3b82f6',
    fontWeight: '600',
    marginTop: 2,
  },
  dateRangeContainer: {
    backgroundColor: '#efe6ff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  dateRangeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6d28d9',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef3c7',
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
    color: '#92400e',
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
    backgroundColor: '#3b82f6',
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
