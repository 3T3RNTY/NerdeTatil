import { Platform, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import Toast from 'react-native-toast-message'
import { AppHeader } from '@/src/components/AppHeader'
import { PageShell } from '@/src/components/PageShell'
import { useAuth } from '@/src/hooks/useAuth'
import LocationPicker from './components/LocationPicker'
import ImageUploader from './components/ImageUploader'
import { PostService } from '@/src/api/postService'

interface Location {
  latitude: number
  longitude: number
  address: string
  city?: string
  country?: string
}

interface UploadedImage {
  url: string
  publicId: string
}

export default function CreatePostScreen() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const { user, token } = useAuth()
  const isWideWeb = Platform.OS === 'web' && width >= 980

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [rating, setRating] = useState<number | undefined>(undefined)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const layoutStyle = StyleSheet.flatten([styles.layout, isWideWeb && styles.layoutWide])
  const cardStyle = StyleSheet.flatten([styles.card, isWideWeb && styles.fullWidthCard])
  const textAreaStyle = StyleSheet.flatten([styles.textArea, isWideWeb && styles.textAreaWide])
  const primaryButtonStyle = StyleSheet.flatten([styles.primaryButton, isSubmitting && styles.primaryButtonDisabled])

  // Validate form
  const validateForm = (): boolean => {
    setFormError('')
    
    if (!description.trim()) {
      setFormError('Description is required')
      return false
    }

    if (description.trim().length < 10) {
      setFormError('Description must be at least 10 characters')
      return false
    }

    if (!selectedLocation) {
      setFormError('Please select a location')
      return false
    }

    if (uploadedImages.length === 0) {
      setFormError('Please upload at least one image')
      return false
    }

    if (rating == null) {
      setFormError('Please select a rating')
      return false
    }

    return true
  }

  // Create or get location
  const handleCreatePost = async () => {
    if (!validateForm()) {
      return
    }

    if (!user?.id || !token) {
      setFormError('Not authenticated')
      return
    }

    if (!selectedLocation) {
      setFormError('Please select a location')
      return
    }

    const location = selectedLocation

    setIsSubmitting(true)

    try {
      // First, check if location exists or create it
      let locationId: string
      
      // Create location with coordinates
      const LocationService = require('@/src/api/locationService').LocationService
      const locationData = {
        name: location.address.split(',')[0] || location.address,
        address: location.address,
        city: location.city,
        country: location.country,
        latitude: location.latitude,
        longitude: location.longitude,
      }

      try {
        const createdLocation = await LocationService.createLocation(locationData)
        locationId = createdLocation.id
      } catch (error) {
        // If location creation fails, try to find existing
        const existingLocations = await LocationService.getLocations({
          search: location.address,
        })
        if (existingLocations.length > 0) {
          locationId = existingLocations[0].id
        } else {
          throw new Error('Failed to create or find location')
        }
      }

      // Create post
      const postData = {
        userId: user.id,
        locationId,
        title: title || undefined,
        description,
        rating: rating ?? undefined,
        imageUrls: uploadedImages.map((img) => img.url),
        isPublic: true,
        allowComments: true,
      }

      const createdPost = await PostService.createPost(postData)

      // Success - Show toast and redirect to profile
      Toast.show({
        type: 'success',
        position: 'bottom',
        text1: '✓ Paylaşım Başarıyla Yayınlandı',
        text1Style: {
          fontSize: 14,
          fontWeight: '600',
          color: '#fff',
          backgroundColor: '#10b981',
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 8,
        },
        visibilityTime: 3000,
      })

      // Redirect to profile after short delay
      setTimeout(() => {
        router.push('/profil')
      }, 500)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create post'
      setFormError(errorMessage)
      Alert.alert('Error', errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const ratingOptions = [1, 2, 3, 4, 5]

  return (
    <View style={styles.screen}>
      <AppHeader />
      <PageShell>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.titleArea}>
            <View style={styles.titleHeader}>
              <View>
                <Text style={styles.title}>✍️ Yeni Paylaşım</Text>
                <Text style={styles.subtitle}>Deneyimlerini fotoğraflarla anlatarak başka seyahatseverleri ilham ver</Text>
              </View>
              <Pressable style={styles.exitButton} onPress={() => router.back()} disabled={isSubmitting}>
                <Text style={styles.exitButtonText}>✕</Text>
              </Pressable>
            </View>
          </View>

          {/* Error Message */}
          {formError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{formError}</Text>
            </View>
          ) : null}

          <View style={layoutStyle}>
            {/* Location Picker */}
            <View style={cardStyle}>
              <View style={styles.cardHeader}>
                <Text style={styles.sectionEmoji}>📍</Text>
                <Text style={styles.sectionTitle}>Konum Seç</Text>
              </View>
              <LocationPicker
                onLocationSelect={setSelectedLocation}
                initialLocation={selectedLocation || undefined}
              />
              {selectedLocation && (
                <View style={styles.selectedLocationBadge}>
                  <Text style={styles.selectedLocationText}>✓ Konum seçildi</Text>
                </View>
              )}
            </View>

            {/* Image Uploader */}
            <View style={cardStyle}>
              <View style={styles.cardHeader}>
                <Text style={styles.sectionEmoji}>📸</Text>
                <Text style={styles.sectionTitle}>Görseller</Text>
              </View>
              <ImageUploader
                onImagesUploaded={setUploadedImages}
                maxImages={10}
                token={token ?? undefined}
              />
              {uploadedImages.length > 0 && (
                <View style={styles.imageCountBadge}>
                  <Text style={styles.imageCountText}>✓ {uploadedImages.length} resim yüklendi</Text>
                </View>
              )}
            </View>

            {/* Rating Selector */}
            <View style={cardStyle}>
              <View style={styles.cardHeader}>
                <Text style={styles.sectionEmoji}>⭐</Text>
                <Text style={styles.sectionTitle}>Puan Ver (1-5)</Text>
              </View>
              <View style={styles.ratingContainer}>
                {ratingOptions.map((option) => {
                  const ratingButtonStyle = StyleSheet.flatten([styles.ratingButton, rating === option && styles.ratingButtonActive])
                  const ratingButtonTextStyle = StyleSheet.flatten([styles.ratingButtonText, rating === option && styles.ratingButtonTextActive])
                  return (
                  <Pressable
                    key={option}
                    style={ratingButtonStyle}
                    onPress={() => setRating(option)}
                    disabled={isSubmitting}
                  >
                    <Text style={ratingButtonTextStyle}>
                      {option}
                    </Text>
                  </Pressable>
                )
                })}
              </View>
              {rating && (
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingBadgeText}>✓ Puan: {rating}/5</Text>
                </View>
              )}
            </View>

            {/* Description Section */}
            <View style={cardStyle}>
              <View style={styles.cardHeader}>
                <Text style={styles.sectionEmoji}>✏️</Text>
                <Text style={styles.sectionTitle}>Başlık (İsteğe bağlı)</Text>
              </View>
              <TextInput
                style={styles.titleInput}
                placeholder="Başlık gir..."
                placeholderTextColor="#9ca3af"
                value={title}
                onChangeText={setTitle}
                editable={!isSubmitting}
              />

              <View style={styles.cardHeader} >
                <Text style={styles.sectionEmoji}>📝</Text>
                <Text style={styles.sectionTitle}>Açıklama (Zorunlu)</Text>
              </View>
              <TextInput
                style={textAreaStyle}
                placeholder="Nerede kaldın, ne yaptın, ne önerirsin? Başka seyahatseverleri ilham ver..."
                placeholderTextColor="#9ca3af"
                multiline
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
                editable={!isSubmitting}
              />
            </View>
          </View>

          <View style={styles.footerActions}>
            <Pressable
              style={primaryButtonStyle}
              onPress={handleCreatePost}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.primaryButtonText}>Yükleniyor...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.primaryButtonEmoji}>📤</Text>
                  <Text style={styles.primaryButtonText}>Paylaş</Text>
                </>
              )}
            </Pressable>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => {
                Alert.alert('Bilgi', 'Taslak kaydetme özelliği yakında gelecek')
              }}
              disabled={isSubmitting}
            >
              <Text style={styles.secondaryButtonEmoji}>💾</Text>
              <Text style={styles.secondaryButtonText}>Taslak Kaydet</Text>
            </Pressable>
          </View>
        </ScrollView>
      </PageShell>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#e8f5f1',
  },
  titleArea: {
    marginBottom: 20,
  },
  titleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0d9488',
  },
  subtitle: {
    fontSize: 14,
    color: '#0f766e',
    fontWeight: '500',
    lineHeight: 20,
    marginTop: 4,
  },
  exitButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  exitButtonText: {
    fontSize: 22,
    color: '#dc2626',
    fontWeight: '700',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '500',
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ccf0e8',
    backgroundColor: '#f0fdf9',
    padding: 16,
    gap: 14,
    shadowColor: '#0d9488',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  fullWidthCard: {
    width: '48%',
  },
  layout: {
    gap: 16,
  },
  layoutWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  mediaCardWide: {
    flex: 1,
  },
  textCardWide: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionEmoji: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0d9488',
  },
  selectedLocationBadge: {
    backgroundColor: '#d1f3ed',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
  },
  selectedLocationText: {
    color: '#0d9488',
    fontWeight: '600',
    fontSize: 13,
  },
  imageCountBadge: {
    backgroundColor: '#d1f3ed',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
  },
  imageCountText: {
    color: '#0d9488',
    fontWeight: '600',
    fontSize: 13,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  ratingButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ccf0e8',
    backgroundColor: '#e8f5f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingButtonActive: {
    borderColor: '#0d9488',
    backgroundColor: '#0d9488',
  },
  ratingButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0d9488',
  },
  ratingButtonTextActive: {
    color: '#fff',
  },
  ratingBadge: {
    backgroundColor: '#d1f3ed',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  ratingBadgeText: {
    color: '#0d9488',
    fontWeight: '600',
    fontSize: 13,
  },
  titleInput: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccf0e8',
    backgroundColor: '#e8f5f1',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
    marginBottom: 12,
  },
  textArea: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccf0e8',
    backgroundColor: '#e8f5f1',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
    minHeight: 120,
  },
  textAreaWide: {
    minHeight: 180,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#0d9488',
    paddingVertical: 14,
    alignItems: 'center',
    gap: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  primaryButtonEmoji: {
    fontSize: 18,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccf0e8',
    backgroundColor: '#e8f5f1',
    paddingVertical: 14,
    alignItems: 'center',
    gap: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonEmoji: {
    fontSize: 18,
  },
  secondaryButtonText: {
    color: '#0d9488',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
})
