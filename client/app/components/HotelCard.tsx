import { Link } from 'expo-router'
import { Pressable, StyleSheet, Text, useWindowDimensions, View, Image } from 'react-native'
import { Post } from '@/src/api/postService'
import { ImagePlaceholder } from '@/src/components/ImagePlaceholder'

interface HotelCardProps {
  post: Post
  isWideWeb?: boolean
  isMobile?: boolean
}

export default function HotelCard({ post, isWideWeb = false, isMobile = false }: HotelCardProps) {
  const { width } = useWindowDimensions()
  
  const cardStyle = StyleSheet.flatten([styles.card, isWideWeb && styles.cardWide])
  const cardImageStyle = StyleSheet.flatten([
    styles.cardImage,
    isWideWeb && styles.cardImageWide,
    isMobile && styles.cardImageMobile,
  ])

  const priceRange = post.metadata?.priceRange || 'Bilgisiz'
  const amenities = Array.isArray(post.metadata?.amenities) ? post.metadata.amenities : []

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
              <Text style={styles.categoryBadgeText}>🏨 Otel</Text>
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
    borderLeftColor: '#8b5cf6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardWide: {
    width: '48%',
    marginRight: '4%',
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
    backgroundColor: '#8b5cf6',
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
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    borderRadius: 6,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5b21b6',
    marginBottom: 2,
  },
  locationCity: {
    fontSize: 11,
    color: '#7c3aed',
  },
  priceContainer: {
    backgroundColor: '#fce7f3',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    borderRadius: 6,
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#831843',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#be185d',
    marginTop: 2,
  },
  amenitiesContainer: {
    marginBottom: 8,
  },
  amenitiesTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5b21b6',
    marginBottom: 6,
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  amenityBadge: {
    backgroundColor: '#ede9fe',
    borderWidth: 1,
    borderColor: '#ddd6fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  amenityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6d28d9',
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
    backgroundColor: '#8b5cf6',
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
