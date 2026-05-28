import { useEffect, useState } from 'react'
import { Link, useLocalSearchParams } from 'expo-router'
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  ActivityIndicator,
  ScrollView,
  Linking,
} from 'react-native'
import { AppHeader } from '@/src/components/AppHeader'
import { PageShell } from '@/src/components/PageShell'
import ImageGallery from '@/app/components/ImageGallery'
import { PostService, PostDetail, Comment } from '@/src/api/postService'
import { tokens } from '@/src/theme/tokens'
import { useAuth } from '@/src/hooks/useAuth'

export default function DetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>()
  const { width } = useWindowDimensions()
  const isWideWeb = Platform.OS === 'web' && width >= 980
  const { user } = useAuth()
  const [post, setPost] = useState<PostDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchPost()
    }
  }, [params.id])

  const fetchPost = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await PostService.getPostById(params.id!)
      setPost(data)
    } catch (err: any) {
      setError(err?.error || 'Paylaşım yüklenemedi')
      console.error('Error fetching post:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!commentText.trim() || !user || !post) {
      return
    }

    try {
      setSubmittingComment(true)
      await PostService.addComment(post.id, {
        userId: user.id,
        content: commentText,
      })
      setCommentText('')
      // Refresh post to show new comment
      await fetchPost()
    } catch (err: any) {
      console.error('Error adding comment:', err)
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleLocationPress = (location: any) => {
    if (!location.latitude || !location.longitude) {
      return
    }

    const latitude = typeof location.latitude === 'string' ? parseFloat(location.latitude) : location.latitude
    const longitude = typeof location.longitude === 'string' ? parseFloat(location.longitude) : location.longitude
    
    const googleMapsUrl = Platform.OS === 'ios'
      ? `maps://maps.apple.com/?ll=${latitude},${longitude}&q=${encodeURIComponent(location.name || 'Location')}`
      : `https://maps.google.com/?q=${latitude},${longitude}`

    Linking.openURL(googleMapsUrl).catch(() => {
      // Fallback to web version if maps app is not available
      Linking.openURL(`https://maps.google.com/?q=${latitude},${longitude}`)
    })
  }

  const contentLayoutStyle = StyleSheet.flatten([styles.contentLayout, isWideWeb && styles.contentLayoutWide])
  const mainColumnStyle = StyleSheet.flatten([styles.mainColumn, isWideWeb && styles.mainColumnWide])
  const sideColumnStyle = StyleSheet.flatten([styles.sideColumn, isWideWeb && styles.sideColumnWide])
  const sendButtonStyle = StyleSheet.flatten([
    styles.sendButton,
    (submittingComment || !commentText.trim()) && styles.sendButtonDisabled,
  ])

  if (loading) {
    const loadingStyle = StyleSheet.flatten([styles.screen, styles.centerContent])
    return (
      <View style={loadingStyle}>
        <ActivityIndicator size="large" color={tokens.colors.infoPrimary} />
      </View>
    )
  }

  if (error || !post) {
    return (
      <View style={styles.screen}>
        <AppHeader />
        <PageShell>
          <Link href="/" asChild>
            <Pressable style={styles.backButton}>
              <Text style={styles.backButtonText}>← Ana sayfa</Text>
            </Pressable>
          </Link>
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error || 'Paylaşım bulunamadı'}</Text>
          </View>
        </PageShell>
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      <AppHeader />
      <PageShell withScroll={true}>
          <Link href="/" asChild>
            <Pressable style={styles.backButton}>
              <Text style={styles.backButtonText}>← Ana sayfa</Text>
            </Pressable>
          </Link>

          <View style={contentLayoutStyle}>
            <View style={mainColumnStyle}>
              {/* Image Gallery */}
              {post.imageUrls && post.imageUrls.length > 0 && (
                <ImageGallery
                  images={post.imageUrls}
                  onImagePress={(index) => console.log('Image pressed:', index)}
                />
              )}

              {/* Category Badge */}
              {post.category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    {post.category === 'TRIP' && '🗺️ Seyahat'}
                    {post.category === 'FOOD_PLACE' && '🍽️ Restoran'}
                    {post.category === 'HOTEL' && '🏨 Otel'}
                    {post.category === 'ATTRACTION' && '🎡 Mekan'}
                  </Text>
                </View>
              )}

              {/* Trip Dates */}
              {post.category === 'TRIP' && post.startDate && post.endDate && (
                <View style={styles.dateRangeCard}>
                  <Text style={styles.dateRangeTitle}>📅 Seyahat Tarihleri</Text>
                  <Text style={styles.dateRangeText}>
                    {new Date(post.startDate).toLocaleDateString('tr-TR')} - {new Date(post.endDate).toLocaleDateString('tr-TR')}
                  </Text>
                </View>
              )}

              {/* Features Display */}
              {post.metadata?.features && post.metadata.features.length > 0 && (
                <View style={styles.featuresContainer}>
                  <Text style={styles.featuresTitle}>⭐ Özellikler</Text>
                  <View style={styles.featureChips}>
                    {post.metadata.features.map((feature: any, index: number) => (
                      <View key={index} style={styles.featureChip}>
                        <Text style={styles.featureChipText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Multi-Criteria Ratings Display */}
              {post.metadata?.ratings && (post.metadata.ratings.cleanliness || post.metadata.ratings.service || post.metadata.ratings.pricePerformance) && (
                <View style={styles.ratingsContainer}>
                  <Text style={styles.ratingsTitle}>📊 Detaylı Değerlendirme</Text>
                  {post.metadata.ratings.cleanliness && (
                    <View style={styles.ratingRow}>
                      <Text style={styles.ratingLabel}>Temizlik</Text>
                      <Text style={styles.ratingValue}>{'★'.repeat(post.metadata.ratings.cleanliness)}{'☆'.repeat(5 - post.metadata.ratings.cleanliness)}</Text>
                    </View>
                  )}
                  {post.metadata.ratings.service && (
                    <View style={styles.ratingRow}>
                      <Text style={styles.ratingLabel}>Hizmet</Text>
                      <Text style={styles.ratingValue}>{'★'.repeat(post.metadata.ratings.service)}{'☆'.repeat(5 - post.metadata.ratings.service)}</Text>
                    </View>
                  )}
                  {post.metadata.ratings.pricePerformance && (
                    <View style={styles.ratingRow}>
                      <Text style={styles.ratingLabel}>Fiyat/Değer</Text>
                      <Text style={styles.ratingValue}>{'★'.repeat(post.metadata.ratings.pricePerformance)}{'☆'.repeat(5 - post.metadata.ratings.pricePerformance)}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Meal Type Display */}
              {post.metadata?.mealType && (
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>🍽️ Yemek Türü</Text>
                  <Text style={styles.infoValue}>{post.metadata.mealType}</Text>
                </View>
              )}

              {/* Price Range Display */}
              {post.metadata?.priceRange && (
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>💰 Fiyat Aralığı</Text>
                  <Text style={styles.infoValue}>{post.metadata.priceRange}</Text>
                </View>
              )}

              {/* Amenities Display */}
              {post.metadata?.amenities && Array.isArray(post.metadata.amenities) && post.metadata.amenities.length > 0 && (
                <View style={styles.amenitiesContainer}>
                  <Text style={styles.amenitiesTitle}>🏢 Olanaklar</Text>
                  <View style={styles.amenitiesList}>
                    {post.metadata.amenities.map((amenity: any, index: number) => (
                      <View key={index} style={styles.amenityItem}>
                        <Text style={styles.amenityText}>✓ {amenity}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Hours Display */}
              {post.metadata?.hours && (
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>⏰ Açılış Saatleri</Text>
                  <Text style={styles.infoValue}>{post.metadata.hours}</Text>
                </View>
              )}

              {/* Locations Display */}
              {post.locations && post.locations.length > 0 && (
                <View style={styles.locationsContainer}>
                  <Text style={styles.locationsTitle}>📍 Konumlar ({post.locations.length})</Text>
                  {post.locations.map((location, index) => (
                    <Pressable 
                      key={index} 
                      onPress={() => handleLocationPress(location)}
                      disabled={!location.latitude || !location.longitude}
                    >
                      {({ pressed }) => (
                        <View style={[
                          styles.locationCard,
                          pressed && styles.locationCardPressed,
                          (!location.latitude || !location.longitude) && styles.locationCardDisabled
                        ]}>
                          <View style={styles.locationHeader}>
                            <Text style={styles.locationNumber}>{index + 1}</Text>
                            <View style={styles.locationInfo}>
                              <Text style={styles.locationName}>
                                {location.name}
                                {location.city && ` , ${location.city}`}
                                {location.country && ` , ${location.country}`}
                              </Text>
                              {location.visitDate && (
                                <Text style={styles.visitDate}>
                                  Ziyaret: {new Date(location.visitDate).toLocaleDateString('tr-TR')}
                                </Text>
                              )}
                            </View>
                          </View>
                          {location.latitude && location.longitude && (
                            <View style={styles.locationFooter}>
                              <Text style={styles.locationCoordinates}>
                                📍 {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°
                              </Text>
                              <Text style={styles.openInMapsText}>Haritada aç →</Text>
                            </View>
                          )}
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
             

              <Text style={styles.meta}>ID: {post.id}</Text>

              <View style={styles.block}>
                <Text style={styles.blockTitle}>{post.title || 'Paylaşım'}</Text>
                <Text style={styles.blockText}>{post.description}</Text>
                {post.user && (
                  <View style={styles.authorInfo}>
                    <Text style={styles.authorText}>
                      Paylaşan: {post.user.username}
                    </Text>
                    <Text style={styles.dateText}>
                      {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={sideColumnStyle}>
              {post.rating && (
                <View style={styles.scoreBox}>
                  <Text style={styles.score}>★ {post.rating}</Text>
                  <Text style={styles.scoreSub}>{post.likesCount} beğeni</Text>
                </View>
              )}

              <View style={styles.block}>
                <Text style={styles.blockTitle}>Yorumlar ({post.comments.length})</Text>
                {post.comments.length === 0 ? (
                  <Text style={styles.emptyText}>Henüz yorum yok</Text>
                ) : (
                  post.comments.map((comment) => (
                    <View key={comment.id} style={styles.commentRow}>
                      <Text style={styles.commentUser}>{comment.user.username}</Text>
                      <Text style={styles.commentText}>{comment.content}</Text>
                      <Text style={styles.commentDate}>
                        {new Date(comment.createdAt).toLocaleDateString('tr-TR')}
                      </Text>
                    </View>
                  ))
                )}
              </View>

              {user && (
                <View style={styles.commentComposer}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Yorumunu yaz..."
                    placeholderTextColor={tokens.colors.textSecondary}
                    value={commentText}
                    onChangeText={setCommentText}
                    editable={!submittingComment}
                    multiline
                  />
                  <Pressable
                    style={sendButtonStyle}
                    onPress={handleAddComment}
                    disabled={submittingComment || !commentText.trim()}
                  >
                      {submittingComment ? (
                      <ActivityIndicator color={tokens.colors.background} size="small" />
                    ) : (
                      <Text style={styles.sendButtonText}>+</Text>
                    )}
                  </Pressable>
                </View>
              )}
            </View>
          </View>
      </PageShell>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tokens.colors.backgroundTertiary,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    minHeight: 38,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  backButtonText: {
    color: tokens.colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: tokens.colors.errorLight,
    borderColor: tokens.colors.errorLight,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  errorText: {
    color: tokens.colors.error,
    fontSize: 12,
    textAlign: 'center',
  },
  meta: {
    color: tokens.colors.textSecondary,
    fontSize: 13,
  },
  locationCard: {
    borderRadius: 16,
    backgroundColor: tokens.colors.secondaryLighter,
    borderWidth: 2,
    borderColor: tokens.colors.primary,
    padding: 14,
    gap: 8,
    marginBottom: 14,
  },
  locationCardPressed: {
    opacity: 0.7,
    backgroundColor: tokens.colors.secondary,
  },
  locationCardDisabled: {
    opacity: 0.6,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  locationEmoji: {
    fontSize: 24,
    marginTop: 2,
  },
  locationInfo: {
    flex: 1,
    gap: 4,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '700',
    color: tokens.colors.primary,
  },

  locationCoordinates: {
    fontSize: 11,
    color: tokens.colors.contrast,
    fontFamily: 'monospace',
    backgroundColor: tokens.colors.primaryLighter,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  locationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  openInMapsText: {
    fontSize: 12,
    color: tokens.colors.primary,
    fontWeight: '600',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: tokens.colors.backgroundSecondary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: tokens.colors.infoLight,
  },
  categoryBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: tokens.colors.infoDark,
  },
  dateRangeCard: {
    borderRadius: 16,
    backgroundColor: tokens.colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: tokens.colors.infoPrimary,
    padding: 14,
    gap: 8,
    marginBottom: 14,
  },
  dateRangeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: tokens.colors.infoDark,
  },
  dateRangeText: {
    fontSize: 13,
    color: tokens.colors.infoDark,
    fontWeight: '600',
  },
  locationsContainer: {
    gap: 12,
    marginBottom: 14,
  },
  locationsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: tokens.colors.primary,
    marginBottom: 4,
  },
  locationNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: tokens.colors.primary,
    width: 28,
    textAlign: 'center',
    marginTop: 2,
  },
  visitDate: {
    fontSize: 11,
    color: tokens.colors.contrast,
    fontStyle: 'italic',
    marginTop: 2,
  },
  contentLayout: {
    gap: 14,
  },
  contentLayoutWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  mainColumn: {
    gap: 14,
  },
  mainColumnWide: {
    flex: 1.1,
  },
  sideColumn: {
    gap: 14,
  },
  sideColumnWide: {
    flex: 0.9,
  },
  heroImageWide: {
    minHeight: 300,
  },
  block: {
    borderRadius: 16,
    backgroundColor: tokens.colors.background,
    borderWidth: 1,
    borderColor: tokens.colors.borderLight,
    padding: 14,
    gap: 8,
  },
  blockTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: tokens.colors.text,
  },
  blockText: {
    color: tokens.colors.textSecondary,
    lineHeight: 20,
  },
  authorInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.borderLight,
    gap: 4,
  },
  authorText: {
    fontSize: 12,
    color: tokens.colors.textSecondary,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 11,
    color: tokens.colors.textTertiary,
  },
  emptyText: {
    fontSize: 13,
    color: tokens.colors.textTertiary,
    fontStyle: 'italic',
  },
  scoreBox: {
    borderRadius: 16,
    backgroundColor: tokens.colors.accentLight,
    borderWidth: 1,
    borderColor: tokens.colors.accentLight,
    padding: 14,
    alignItems: 'center',
  },
  score: {
    color: tokens.colors.accentDark,
    fontSize: 30,
    fontWeight: '800',
  },
  scoreSub: {
    color: tokens.colors.accentDark,
    marginTop: 4,
    fontSize: 12,
  },
  commentRow: {
    borderRadius: 12,
    backgroundColor: tokens.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: tokens.colors.borderLight,
    padding: 10,
    gap: 4,
    marginBottom: 8,
  },
  commentUser: {
    fontSize: 13,
    fontWeight: '700',
    color: tokens.colors.text,
  },
  commentText: {
    color: tokens.colors.textSecondary,
    fontSize: 12,
  },
  commentDate: {
    fontSize: 11,
    color: tokens.colors.textTertiary,
  },
  commentComposer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-end',
  },
  commentInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: tokens.colors.text,
  },
  sendButton: {
    height: 44,
    width: 44,
    borderRadius: 12,
    backgroundColor: tokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: tokens.colors.background,
    fontSize: 24,
    lineHeight: 26,
    fontWeight: '600',
  },
  featuresContainer: {
    gap: 8,
    marginBottom: 14,
  },
  featuresTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: tokens.colors.primary,
    marginBottom: 4,
  },
  featureChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureChip: {
    backgroundColor: tokens.colors.secondaryLight,
    borderColor: tokens.colors.secondary,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  featureChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: tokens.colors.secondary,
  },
  ratingsContainer: {
    borderRadius: 16,
    backgroundColor: tokens.colors.backgroundTertiary,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    padding: 14,
    gap: 12,
    marginBottom: 14,
  },
  ratingsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: tokens.colors.text,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: tokens.colors.textSecondary,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: '700',
    color: tokens.colors.accentSecondary,
    letterSpacing: 2,
  },
  infoCard: {
    borderRadius: 16,
    backgroundColor: tokens.colors.infoLight,
    borderWidth: 1,
    borderColor: tokens.colors.infoPrimary,
    padding: 14,
    gap: 6,
    marginBottom: 14,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: tokens.colors.infoDark,
  },
  infoValue: {
    fontSize: 13,
    color: tokens.colors.infoPrimary,
    fontWeight: '500',
  },
  amenitiesContainer: {
    gap: 8,
    marginBottom: 14,
  },
  amenitiesTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: tokens.colors.primary,
    marginBottom: 4,
  },
  amenitiesList: {
    gap: 6,
  },
  amenityItem: {
    borderRadius: 8,
    backgroundColor: tokens.colors.primaryLighter,
    borderLeftWidth: 3,
    borderLeftColor: tokens.colors.secondary,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  amenityText: {
    fontSize: 13,
    color: tokens.colors.secondary,
    fontWeight: '500',
  },
})
