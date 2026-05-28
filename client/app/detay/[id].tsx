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
  Alert,
} from 'react-native'
import { AppHeader } from '@/src/components/AppHeader'
import { PageShell } from '@/src/components/PageShell'
import ImageGallery from '@/app/components/ImageGallery'
import { PostService, PostDetail, Comment } from '@/src/api/postService'
import { tokens } from '@/src/theme/tokens'
import { useAuth } from '@/src/hooks/useAuth'
import { getTagColorSchemeByHash } from '@/src/utils/tagColors'
import { getThemeColorScheme } from '@/src/utils/themeColors'

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
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const themeColors = getThemeColorScheme(post?.theme?.name || 'Seyahat')

  useEffect(() => {
    if (params.id) {
      fetchPost()
    }
  }, [params.id])

  useEffect(() => {
    console.log('[DetailScreen] Component state update', {
      hasUser: !!user,
      userId: user?.id,
      hasPost: !!post,
      postUserId: post?.userId,
      commentsCount: post?.comments?.length || 0,
    })
  }, [user, post])

  const fetchPost = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await PostService.getPostById(params.id!)
      console.log('[fetchPost] Loaded post:', { id: data.id, userId: data.userId, commentsCount: data.comments?.length })
      console.log('[fetchPost] Current user:', user)
      setPost(data)
    } catch (err: any) {
      console.error('Error fetching post:', err)
      setError(err?.error || 'Paylaşım yüklenemedi')
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
        parentCommentId: replyingTo || undefined,
      })
      setCommentText('')
      setReplyingTo(null)
      // Refresh post to show new comment
      await fetchPost()
    } catch (err: any) {
      console.error('Error adding comment:', err)
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    console.log('[handleDeleteComment] Starting delete', { commentId, postId: post?.id, userId: user?.id })
    
    if (!post) {
      console.log('[handleDeleteComment] No post')
      return
    }
    
    if (!user) {
      console.log('[handleDeleteComment] No user')
      Alert.alert('Hata', 'Yorum silmek için giriş yapmanız gerekir')
      return
    }

    const comment = post.comments?.find(c => c.id === commentId || c.replies?.some(r => r.id === commentId))
    console.log('[handleDeleteComment] Found comment:', { commentId, commentUserId: comment?.user?.id, postUserId: post.userId })

    Alert.alert(
      'Yorumu Sil', 
      'Bu yorumu silmek istediğinizden emin misiniz?', 
      [
        { 
          text: 'İptal', 
          onPress: () => {
            console.log('[handleDeleteComment] Deletion cancelled by user')
          }, 
          style: 'cancel' 
        },
        {
          text: 'Sil',
          onPress: async () => {
            try {
              console.log('[handleDeleteComment] Calling API delete', { postId: post.id, commentId })
              const result = await PostService.deleteComment(post.id, commentId)
              console.log('[handleDeleteComment] Delete API response:', result)
              console.log('[handleDeleteComment] Fetching updated post after deletion')
              await fetchPost()
              console.log('[handleDeleteComment] Post refreshed successfully')
            } catch (err: any) {
              console.error('[handleDeleteComment] Error deleting comment:', err)
              console.log('[handleDeleteComment] Error details:', { 
                status: err?.status, 
                statusText: err?.statusText,
                errorMessage: err?.error,
                fullError: err 
              })
              Alert.alert('Hata', err?.error || 'Yorum silinemedi')
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: false }
    )
  }

  const handleEditComment = async (commentId: string) => {
    if (!editingText.trim() || !post) return
    if (!user) {
      Alert.alert('Hata', 'Yorum düzenlemek için giriş yapmanız gerekir')
      return
    }

    try {
      await PostService.editComment(post.id, commentId, editingText)
      setEditingCommentId(null)
      setEditingText('')
      await fetchPost()
    } catch (err: any) {
      console.error('Error editing comment:', err)
      Alert.alert('Hata', err?.error || 'Yorum güncellenemedi')
    }
  }

  const canDeleteComment = (commentUserId: string): boolean => {
    const isCommentAuthor = user?.id === commentUserId
    const isPostOwner = post?.userId === user?.id
    const canDelete = isCommentAuthor || isPostOwner
    console.log(`[canDeleteComment] userId=${user?.id}, commentUserId=${commentUserId}, postOwnerId=${post?.userId}, isAuthor=${isCommentAuthor}, isOwner=${isPostOwner}, canDelete=${canDelete}`)
    return canDelete
  }

  const canEditComment = (commentUserId: string): boolean => {
    const canEdit = user?.id === commentUserId
    console.log(`[canEditComment] userId=${user?.id}, commentUserId=${commentUserId}, canEdit=${canEdit}`)
    return canEdit
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

  // Render a single comment with nested replies
  const renderComment = (comment: Comment, postOwnerId: string | undefined, isReply = false) => {
    const isPostOwner = comment.user.id === postOwnerId
    const isEditingThisComment = editingCommentId === comment.id
    
    // Debug logging
    if (!comment.user) {
      console.warn('[renderComment] Comment missing user object:', comment)
      return null
    }

    return (
      <View key={comment.id} style={[styles.commentRow, isReply && styles.commentRowReply]}>
        {/* Comment Header */}
        <View style={styles.commentHeader}>
          <Text style={styles.commentUser}>
            {comment.user.username}
            {isPostOwner && <Text style={styles.postOwnerBadge}> İçerik Sahibi</Text>}
          </Text>
          <Text style={styles.commentDate}>
            {new Date(comment.createdAt).toLocaleDateString('tr-TR')}
            {comment.isEdited && <Text style={styles.editedIndicator}> (düzenlendi)</Text>}
          </Text>
        </View>

        {/* Comment Content */}
        {isEditingThisComment ? (
          <View style={styles.editModeContainer}>
            <TextInput
              style={styles.editInput}
              value={editingText}
              onChangeText={setEditingText}
              multiline
              editable={!submittingComment}
            />
            <View style={styles.editButtonsRow}>
              <Pressable
                style={styles.saveButton}
                onPress={() => handleEditComment(comment.id)}
                disabled={submittingComment}
              >
                <Text style={styles.saveButtonText}>Kaydet</Text>
              </Pressable>
              <Pressable
                style={styles.cancelButton}
                onPress={() => {
                  setEditingCommentId(null)
                  setEditingText('')
                }}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Text style={styles.commentText}>{comment.content}</Text>
        )}

        {/* Comment Actions */}
        <View style={styles.commentActionsRow}>
          {user && !isEditingThisComment && (
            <Pressable
              onPress={() => setReplyingTo(comment.id)}
              disabled={replyingTo === comment.id}
            >
              <Text style={styles.commentActionText}>Yanıtla</Text>
            </Pressable>
          )}
          {canEditComment(comment.user.id) && !isEditingThisComment && (
            <Pressable
              onPress={() => {
                setEditingCommentId(comment.id)
                setEditingText(comment.content)
              }}
            >
              <Text style={styles.commentActionText}>Düzenle</Text>
            </Pressable>
          )}
          {(() => {
            const canDelete = canDeleteComment(comment.user.id)
            const isEditingThisComment = editingCommentId === comment.id
            console.log('[renderComment] Delete button check: canDelete=', canDelete, 'isEditing=', isEditingThisComment, 'commentUserId=', comment.user.id, 'userId=', user?.id)
            if (canDelete && !isEditingThisComment) {
              console.log('[renderComment] Rendering delete button for comment:', comment.id)
              return (
                <Pressable onPress={() => {
                  console.log('[renderComment] Delete button pressed for comment:', comment.id)
                  handleDeleteComment(comment.id)
                }}>
                  <Text style={[styles.commentActionText, styles.deleteAction]}>Sil</Text>
                </Pressable>
              )
            }
            console.log('[renderComment] Delete button NOT rendered - canDelete:', canDelete, 'isEditing:', isEditingThisComment)
            return null
          })()}
        </View>

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <View style={styles.repliesContainer}>
            {comment.replies.map((reply) => renderComment(reply, postOwnerId, true))}
          </View>
        )}
      </View>
    )
  }

  // Comments JSX - will be conditionally rendered in main or side column
  const commentsSection = post ? (
    <>
      <View style={styles.block}>
        <Text style={styles.blockTitle}>Yorumlar ({post.comments?.length || 0})</Text>
        {!post.comments || post.comments.length === 0 ? (
          <Text style={styles.emptyText}>Henüz yorum yok</Text>
        ) : (
          post.comments.map((comment) => renderComment(comment, post.userId))
        )}
      </View>

      {user && (
        <View style={styles.commentComposer}>
          {replyingTo && (
            <View style={styles.replyingToInfo}>
              <Text style={styles.replyingToText}>
                Yanıtlanıyor: {post.comments?.find((c) => c.id === replyingTo)?.user.username || 'Kullanıcı'}
              </Text>
              <Pressable
                onPress={() => {
                  setReplyingTo(null)
                  setCommentText('')
                }}
              >
                <Text style={styles.cancelReplyText}>× İptal</Text>
              </Pressable>
            </View>
          )}
          <View style={styles.composerInput}>
            <TextInput
              style={styles.commentInput}
              placeholder={replyingTo ? 'Yanıtını yaz...' : 'Yorumunu yaz...'}
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
        </View>
      )}
    </>
  ) : null

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

              {/* Theme Badge with SubThemes */}
              {post.theme && themeColors && (
                <View style={styles.themeAndSubThemesContainer}>
                  <View style={StyleSheet.flatten([
                    styles.themeBadge,
                    {
                      backgroundColor: themeColors.backgroundColor,
                      borderColor: themeColors.borderColor,
                    }
                  ])}>
                    <Text style={StyleSheet.flatten([styles.themeBadgeText, { color: themeColors.textColor }])}>
                      {post.theme.emoji} {post.theme.name}
                    </Text>
                  </View>

                  {/* SubThemes Display */}
                  {post.theme.subThemes && post.theme.subThemes.length > 0 && post.subThemeIds && post.subThemeIds.length > 0 && (
                    <View style={styles.subThemesChips}>
                      {post.theme.subThemes
                        .filter(st => post.subThemeIds.includes(st.id))
                        .map((subTheme) => (
                          <View key={subTheme.id} style={styles.subThemeChip}>
                            <Text style={styles.subThemeChipText}>{subTheme.name}</Text>
                          </View>
                        ))}
                    </View>
                  )}
                </View>
              )}

              {/* Default Theme Badge for Old Posts */}
              {!post.theme && themeColors && (
                <View style={StyleSheet.flatten([
                  styles.themeBadge,
                  {
                    backgroundColor: themeColors.backgroundColor,
                    borderColor: themeColors.borderColor,
                  }
                ])}>
                  <Text style={StyleSheet.flatten([styles.themeBadgeText, { color: themeColors.textColor }])}>
                    ✈️ Seyahat
                  </Text>
                </View>
              )}

              {/* Title and Description Block */}
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
                              {/* Location-specific rating badge */}
                              {location.rating && (
                                <View style={styles.locationRatingBadge}>
                                  <Text style={styles.locationRatingBadgeText}>
                                    ⭐ {location.rating?.toFixed(1)} / 5
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>

                          {/* Location-specific description */}
                          {location.description && (
                            <View style={styles.locationDescription}>
                              <Text style={styles.locationDescriptionText}>{location.description}</Text>
                            </View>
                          )}

                          {/* Location-specific multi-criteria ratings */}
                          {location.multiCriteriaRatings && (
                            <View style={styles.locationMultiCriteria}>
                              <Text style={styles.locationCriteriaTitle}>Detaylı Puanlama</Text>
                              {location.multiCriteriaRatings.optionVariety && (
                                <View style={styles.criteriaRow}>
                                  <Text style={styles.criteriaLabel}>Çeşitlilik</Text>
                                  <Text style={styles.criteriaStars}>
                                    {'⭐'.repeat(location.multiCriteriaRatings.optionVariety)}
                                    {'☆'.repeat(5 - location.multiCriteriaRatings.optionVariety)}
                                  </Text>
                                </View>
                              )}
                              {location.multiCriteriaRatings.location && (
                                <View style={styles.criteriaRow}>
                                  <Text style={styles.criteriaLabel}>Konum</Text>
                                  <Text style={styles.criteriaStars}>
                                    {'⭐'.repeat(location.multiCriteriaRatings.location)}
                                    {'☆'.repeat(5 - location.multiCriteriaRatings.location)}
                                  </Text>
                                </View>
                              )}
                              {location.multiCriteriaRatings.accessibility && (
                                <View style={styles.criteriaRow}>
                                  <Text style={styles.criteriaLabel}>Erişilebilirlik</Text>
                                  <Text style={styles.criteriaStars}>
                                    {'⭐'.repeat(location.multiCriteriaRatings.accessibility)}
                                    {'☆'.repeat(5 - location.multiCriteriaRatings.accessibility)}
                                  </Text>
                                </View>
                              )}
                              {location.multiCriteriaRatings.priceValue && (
                                <View style={styles.criteriaRow}>
                                  <Text style={styles.criteriaLabel}>Fiyat/Değer</Text>
                                  <Text style={styles.criteriaStars}>
                                    {'⭐'.repeat(location.multiCriteriaRatings.priceValue)}
                                    {'☆'.repeat(5 - location.multiCriteriaRatings.priceValue)}
                                  </Text>
                                </View>
                              )}
                            </View>
                          )}

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

              {/* Multi-Criteria Ratings Display */}
              {post.multiCriteriaRatings && (
                <View style={styles.ratingsContainer}>
                  <Text style={styles.ratingsTitle}>📊 Detaylı Değerlendirme</Text>
                  <View style={styles.ratingRow}>
                    <Text style={styles.ratingLabel}>Çeşitlilik</Text>
                    <Text style={styles.ratingValue}>{'★'.repeat(post.multiCriteriaRatings.optionVariety || 0)}{'☆'.repeat(5 - (post.multiCriteriaRatings.optionVariety || 0))}</Text>
                  </View>
                  <View style={styles.ratingRow}>
                    <Text style={styles.ratingLabel}>Konum</Text>
                    <Text style={styles.ratingValue}>{'★'.repeat(post.multiCriteriaRatings.location || 0)}{'☆'.repeat(5 - (post.multiCriteriaRatings.location || 0))}</Text>
                  </View>
                  <View style={styles.ratingRow}>
                    <Text style={styles.ratingLabel}>Erişilebilirlik</Text>
                    <Text style={styles.ratingValue}>{'★'.repeat(post.multiCriteriaRatings.accessibility || 0)}{'☆'.repeat(5 - (post.multiCriteriaRatings.accessibility || 0))}</Text>
                  </View>
                  <View style={styles.ratingRow}>
                    <Text style={styles.ratingLabel}>Fiyat/Değer</Text>
                    <Text style={styles.ratingValue}>{'★'.repeat(post.multiCriteriaRatings.priceValue || 0)}{'☆'.repeat(5 - (post.multiCriteriaRatings.priceValue || 0))}</Text>
                  </View>
                </View>
              )}

              {/* Comments Section - Mobile Only */}
              {!isWideWeb && commentsSection}

              {/* Additional Details (Category, Features, etc.) */}
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
                    {post.metadata.features.map((feature: any, index: number) => {
                      const colorScheme = getTagColorSchemeByHash(feature)
                      return (
                        <View 
                          key={index} 
                          style={[
                            styles.featureChip,
                            {
                              backgroundColor: colorScheme.backgroundColor,
                              borderColor: colorScheme.borderColor,
                            }
                          ]}
                        >
                          <Text style={[styles.featureChipText, { color: colorScheme.textColor }]}>
                            {feature}
                          </Text>
                        </View>
                      )
                    })}
                  </View>
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

              <Text style={styles.meta}>ID: {post.id}</Text>
            </View>

            <View style={sideColumnStyle}>
              {post.rating && (
                <View style={styles.scoreBox}>
                  <Text style={styles.score}>★ {post.rating}</Text>
                  <Text style={styles.scoreSub}>{post.likesCount} beğeni</Text>
                </View>
              )}

              {/* Comments Section - Web Only */}
              {isWideWeb && commentsSection}
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
  themeBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 2,
  },
  themeBadgeText: {
    fontSize: 15,
    fontWeight: '700',
  },
  themeAndSubThemesContainer: {
    gap: 10,
    marginBottom: 12,
  },
  subThemesChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subThemeChip: {
    backgroundColor: tokens.colors.primaryLighter,
    borderWidth: 1,
    borderColor: tokens.colors.primary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  subThemeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: tokens.colors.primary,
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
    gap: 8,
    marginBottom: 8,
  },
  commentRowReply: {
    marginLeft: 12,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: tokens.colors.primary,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentUser: {
    fontSize: 13,
    fontWeight: '700',
    color: tokens.colors.text,
  },
  postOwnerBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: tokens.colors.primary,
    backgroundColor: tokens.colors.primaryLighter,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  commentText: {
    color: tokens.colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  commentDate: {
    fontSize: 11,
    color: tokens.colors.textTertiary,
  },
  editedIndicator: {
    fontSize: 10,
    fontWeight: '600',
    color: tokens.colors.textTertiary,
    fontStyle: 'italic',
  },
  commentActionsRow: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 4,
  },
  commentActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: tokens.colors.primary,
  },
  deleteAction: {
    color: tokens.colors.error,
  },
  editModeContainer: {
    gap: 8,
  },
  editInput: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.colors.primary,
    backgroundColor: tokens.colors.background,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: tokens.colors.text,
    minHeight: 60,
    maxHeight: 120,
  },
  editButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  saveButton: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: tokens.colors.primary,
    paddingVertical: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: tokens.colors.background,
    fontSize: 12,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: tokens.colors.borderLight,
    paddingVertical: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: tokens.colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  repliesContainer: {
    marginTop: 8,
    gap: 0,
  },
  commentComposer: {
    gap: 8,
  },
  replyingToInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: tokens.colors.primaryLighter,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  replyingToText: {
    fontSize: 12,
    fontWeight: '600',
    color: tokens.colors.primary,
  },
  cancelReplyText: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.primary,
  },
  composerInput: {
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
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  featureChipText: {
    fontSize: 12,
    fontWeight: '600',
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
  // Location-specific rating styles
  locationRatingBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: tokens.colors.accentLight,
    borderRadius: 6,
  },
  locationRatingBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: tokens.colors.accentDark,
  },
  locationDescription: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: tokens.colors.backgroundSecondary,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: tokens.colors.primary,
  },
  locationDescriptionText: {
    fontSize: 12,
    color: tokens.colors.textSecondary,
    lineHeight: 16,
  },
  locationMultiCriteria: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: tokens.colors.backgroundSecondary,
    borderRadius: 8,
    gap: 6,
  },
  locationCriteriaTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: tokens.colors.text,
    marginBottom: 4,
  },
  criteriaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  criteriaLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: tokens.colors.textSecondary,
    flex: 1,
  },
  criteriaStars: {
    fontSize: 12,
    letterSpacing: 1,
  },
})
