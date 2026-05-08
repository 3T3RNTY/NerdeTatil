import { Platform, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View, ScrollView, Alert, ActivityIndicator, Modal } from 'react-native'
import { useRouter } from 'expo-router'
import { useState, useEffect } from 'react'
import Toast from 'react-native-toast-message'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { AppHeader } from '@/src/components/AppHeader'
import { PageShell } from '@/src/components/PageShell'
import { useAuth } from '@/src/hooks/useAuth'
import MultiLocationPicker from './components/MultiLocationPicker'
import CategorySelector from './components/CategorySelector'
import ImageUploader from './components/ImageUploader'
import ProgressStepper from './components/ProgressStepper'
import DynamicFeatureChips from './components/DynamicFeatureChips'
import MultiCriteriaRatingSliders from './components/MultiCriteriaRatingSliders'
import { PostService, PostCategory, LocationData } from '@/src/api/postService'

// Web date picker imports
let DayPicker: any = null
if (Platform.OS === 'web') {
  try {
    const module = require('react-day-picker')
    DayPicker = module.DayPicker
    // Import DayPicker CSS
    require('react-day-picker/dist/style.css')
  } catch (e) {
    // Fallback if module not available
  }
}

interface UploadedImage {
  url: string
  publicId: string
}

interface MultiCriteriaRatingValues {
  cleanliness: number
  service: number
  pricePerformance: number
}

export default function CreatePostScreen() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const { user, token } = useAuth()
  const isWideWeb = Platform.OS === 'web' && width >= 980

  // Step navigation state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)

  // Form state
  const [category, setCategory] = useState<PostCategory | null>(null)
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [ratings, setRatings] = useState<MultiCriteriaRatingValues>({
    cleanliness: 3,
    service: 3,
    pricePerformance: 3,
  })
  const [selectedLocations, setSelectedLocations] = useState<LocationData[]>([])
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [showStartDatePicker, setShowStartDatePicker] = useState(false)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)
  const [showWebStartCalendar, setShowWebStartCalendar] = useState(false)
  const [showWebEndCalendar, setShowWebEndCalendar] = useState(false)
  const [mealType, setMealType] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [amenities, setAmenities] = useState('')
  const [hours, setHours] = useState('')
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const layoutStyle = StyleSheet.flatten([styles.layout, isWideWeb && styles.layoutWide])
  const cardStyle = StyleSheet.flatten([styles.card, isWideWeb && styles.fullWidthCard])
  const textAreaStyle = StyleSheet.flatten([styles.textArea, isWideWeb && styles.textAreaWide])
  const primaryButtonStyle = StyleSheet.flatten([styles.primaryButton, isSubmitting && styles.primaryButtonDisabled])

  // Step navigation helpers
  const canProceedToNext = (): boolean => {
    setFormError('')

    if (currentStep === 1) {
      if (!category) {
        setFormError('Lütfen bir kategori seçin')
        return false
      }
      return true
    }

    if (currentStep === 2) {
      if (!description.trim()) {
        setFormError('Açıklama gereklidir')
        return false
      }
      if (description.trim().length < 10) {
        setFormError('Açıklama en az 10 karakter olmalı')
        return false
      }
      if (selectedLocations.length === 0) {
        setFormError('Lütfen en az bir konum ekleyin')
        return false
      }
      return true
    }

    if (currentStep === 3) {
      if (uploadedImages.length === 0) {
        setFormError('Lütfen en az bir görüntü yükleyin')
        return false
      }
      return true
    }

    return true
  }

  const goNextStep = () => {
    if (canProceedToNext() && currentStep < 3) {
      setCurrentStep((currentStep + 1) as 1 | 2 | 3)
      setFormError('')
    }
  }

  const goPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as 1 | 2 | 3)
      setFormError('')
    }
  }

  // Validate entire form before submission
  const validateForm = (): boolean => {
    setFormError('')

    if (!category) {
      setFormError('Lütfen bir kategori seçin')
      return false
    }

    if (!title.trim()) {
      setFormError('Başlık gereklidir')
      return false
    }

    if (title.trim().length < 3) {
      setFormError('Başlık en az 3 karakter olmalı')
      return false
    }

    if (!description.trim()) {
      setFormError('Açıklama gereklidir')
      return false
    }

    if (description.trim().length < 10) {
      setFormError('Açıklama en az 10 karakter olmalı')
      return false
    }

    if (selectedLocations.length === 0) {
      setFormError('Lütfen en az bir konum ekleyin')
      return false
    }

    if (uploadedImages.length === 0) {
      setFormError('Lütfen en az bir görüntü yükleyin')
      return false
    }

    return true
  }

  // Handle post creation
  const handleCreatePost = async () => {
    if (!validateForm()) {
      return
    }

    if (!user?.id || !token) {
      setFormError('Kimlik doğrulaması yapılmamış')
      return
    }

    setIsSubmitting(true)

    try {
      // Build metadata based on category
      const metadata: any = {
        features: selectedFeatures,
        ratings,
      }
      
      if (category === 'FOOD_PLACE') {
        if (mealType) metadata.mealType = mealType
        if (priceRange) metadata.priceRange = priceRange
      } else if (category === 'HOTEL') {
        if (priceRange) metadata.priceRange = priceRange
        if (amenities) {
          metadata.amenities = amenities
            .split(',')
            .map((a) => a.trim())
            .filter((a) => a.length > 0)
        }
      } else if (category === 'ATTRACTION') {
        if (hours) metadata.hours = hours
      }

      // Create post
      const postData = {
        userId: user.id,
        category: category!,
        title: title.trim(),
        description,
        imageUrls: uploadedImages.map((img) => img.url),
        locations: selectedLocations,
        startDate: startDate ? startDate.toISOString() : undefined,
        endDate: endDate ? endDate.toISOString() : undefined,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
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
      const errorMessage = error instanceof Error ? error.message : 'Paylaşım oluşturulamadı'
      setFormError(errorMessage)
      Alert.alert('Hata', errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const ratingOptions = [1, 2, 3, 4, 5]

  const handleStartDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'set' && selectedDate) {
      setStartDate(selectedDate)
    }
    if (Platform.OS === 'android' || event.type === 'dismissed') {
      setShowStartDatePicker(false)
    }
  }

  const handleEndDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'set' && selectedDate) {
      setEndDate(selectedDate)
    }
    if (Platform.OS === 'android' || event.type === 'dismissed') {
      setShowEndDatePicker(false)
    }
  }

  const handleWebDateChange = (dateString: string, isStart: boolean) => {
    if (!dateString) return
    const date = new Date(dateString)
    if (isStart) {
      setStartDate(date)
    } else {
      setEndDate(date)
    }
  }

  const formatDateForInput = (date: Date | null) => {
    if (!date) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const formatDateForDisplay = (date: Date | null) => {
    if (!date) return 'Tarih seçin'
    return date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })
  }



  return (
    <View style={styles.screen}>
      <AppHeader />
      <ProgressStepper currentStep={currentStep} />
      
      <PageShell>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Error Message */}
          {formError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{formError}</Text>
            </View>
          ) : null}

          {/* STEP 1: Category & Features */}
          {currentStep === 1 && (
            <View style={styles.stepContainer}>
              <View style={styles.titleArea}>
                <Text style={styles.stepTitle}>✨ Kategori ve Özellikleri Seçin</Text>
                <Text style={styles.stepSubtitle}>Paylaştığınız içeriği seçin ve önemli özellikleri vurgulayın</Text>
              </View>

              {/* Category Selector */}
              <View style={cardStyle}>
                <View style={styles.cardHeader}>
                  <Text style={styles.sectionEmoji}>📂</Text>
                  <Text style={styles.sectionTitle}>Kategori</Text>
                </View>
                <CategorySelector selected={category} onSelect={setCategory} />
              </View>

              {/* Dynamic Feature Chips */}
              {category && (
                <View style={cardStyle}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.sectionEmoji}>⭐</Text>
                    <Text style={styles.sectionTitle}>Özellikler</Text>
                  </View>
                  <DynamicFeatureChips
                    category={category}
                    selectedFeatures={selectedFeatures}
                    onFeaturesSelect={setSelectedFeatures}
                  />
                </View>
              )}
            </View>
          )}

          {/* STEP 2: Details & Location */}
          {currentStep === 2 && (
            <View style={styles.stepContainer}>
              <View style={styles.titleArea}>
                <Text style={styles.stepTitle}>📝 Detaylar ve Konum</Text>
                <Text style={styles.stepSubtitle}>Deneyiminiz hakkında bize daha fazla bilgi verin</Text>
              </View>

              {/* Description */}
              <View style={cardStyle}>
                <View style={styles.cardHeader}>
                  <Text style={styles.sectionEmoji}>✏️</Text>
                  <Text style={styles.sectionTitle}>Başlık *</Text>
                </View>
                <TextInput
                  style={styles.titleInput}
                  placeholder="Paylaşımınıza bir başlık verin..."
                  placeholderTextColor="#9ca3af"
                  value={title}
                  onChangeText={setTitle}
                  editable={!isSubmitting}
                />
              </View>

              <View style={cardStyle}>
                <View style={styles.cardHeader}>
                  <Text style={styles.sectionEmoji}>📝</Text>
                  <Text style={styles.sectionTitle}>Açıklama *</Text>
                </View>
                <TextInput
                  style={textAreaStyle}
                  placeholder="Deneyiminizi ayrıntılı olarak açıklayın..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  textAlignVertical="top"
                  value={description}
                  onChangeText={setDescription}
                  editable={!isSubmitting}
                />
              </View>

              {/* Location */}
              <View style={cardStyle}>
                <View style={styles.cardHeader}>
                  <Text style={styles.sectionEmoji}>📍</Text>
                  <Text style={styles.sectionTitle}>Konumlar *</Text>
                </View>
                <MultiLocationPicker
                  onLocationsSelect={setSelectedLocations}
                  maxLocations={10}
                />
                {selectedLocations.length > 0 && (
                  <View style={styles.selectedLocationBadge}>
                    <Text style={styles.selectedLocationText}>✓ {selectedLocations.length} konum seçildi</Text>
                  </View>
                )}
              </View>

              {/* Trip Dates (for TRIP category) */}
              {category === 'TRIP' && (
                <View style={cardStyle}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.sectionEmoji}>📅</Text>
                    <Text style={styles.sectionTitle}>Seyahat Tarihleri (İsteğe Bağlı)</Text>
                  </View>
                  <Text style={styles.dateHint}>En az bir tarih seçin veya boş bırakın</Text>
                  
                  {Platform.OS === 'web' ? (
                    /* Web: Use calendar date pickers */
                    <>
                      {/* Start Date Web Picker */}
                      <View style={styles.dateInputRow}>
                        <Text style={styles.dateWebLabel}>📍 Başlangıç Tarihi</Text>
                        <Pressable
                          style={styles.webDateButton}
                          onPress={() => setShowWebStartCalendar(!showWebStartCalendar)}
                        >
                          <Text style={[styles.webDateButtonText, !startDate && styles.webDateButtonPlaceholder]}>
                            {formatDateForDisplay(startDate)}
                          </Text>
                        </Pressable>
                        {showWebStartCalendar && DayPicker && (
                          <View style={styles.calendarContainer}>
                            <DayPicker
                              mode="single"
                              selected={startDate}
                              onSelect={(date: Date | undefined) => {
                                setStartDate(date || null)
                                setShowWebStartCalendar(false)
                              }}
                            />
                          </View>
                        )}
                      </View>

                      {/* End Date Web Picker */}
                      <View style={styles.dateInputRow}>
                        <Text style={styles.dateWebLabel}>🏁 Bitiş Tarihi</Text>
                        <Pressable
                          style={styles.webDateButton}
                          onPress={() => setShowWebEndCalendar(!showWebEndCalendar)}
                        >
                          <Text style={[styles.webDateButtonText, !endDate && styles.webDateButtonPlaceholder]}>
                            {formatDateForDisplay(endDate)}
                          </Text>
                        </Pressable>
                        {showWebEndCalendar && DayPicker && (
                          <View style={styles.calendarContainer}>
                            <DayPicker
                              mode="single"
                              selected={endDate}
                              onSelect={(date: Date | undefined) => {
                                setEndDate(date || null)
                                setShowWebEndCalendar(false)
                              }}
                            />
                          </View>
                        )}
                      </View>
                    </>
                  ) : (
                    /* Mobile: Use DateTimePicker */
                    <>
                      {/* Start Date Picker */}
                      <View style={styles.datePickerContainer}>
                        <Pressable 
                          style={styles.dateButton}
                          onPress={() => setShowStartDatePicker(true)}
                        >
                          <Text style={styles.dateButtonEmoji}>📍</Text>
                          <View style={styles.dateButtonContent}>
                            <Text style={styles.dateButtonLabel}>Başlangıç Tarihi</Text>
                            <Text style={[styles.dateButtonValue, !startDate && styles.dateButtonValueEmpty]}>
                              {formatDateForDisplay(startDate)}
                            </Text>
                          </View>
                          <Text style={styles.dateButtonChevron}>›</Text>
                        </Pressable>
                        {startDate && (
                          <Pressable 
                            style={styles.clearButton}
                            onPress={() => setStartDate(null)}
                          >
                            <Text style={styles.clearButtonText}>✕</Text>
                          </Pressable>
                        )}
                      </View>

                      {/* End Date Picker */}
                      <View style={[styles.datePickerContainer, { marginTop: 10 }]}>
                        <Pressable 
                          style={styles.dateButton}
                          onPress={() => setShowEndDatePicker(true)}
                        >
                          <Text style={styles.dateButtonEmoji}>🏁</Text>
                          <View style={styles.dateButtonContent}>
                            <Text style={styles.dateButtonLabel}>Bitiş Tarihi</Text>
                            <Text style={[styles.dateButtonValue, !endDate && styles.dateButtonValueEmpty]}>
                              {formatDateForDisplay(endDate)}
                            </Text>
                          </View>
                          <Text style={styles.dateButtonChevron}>›</Text>
                        </Pressable>
                        {endDate && (
                          <Pressable 
                            style={styles.clearButton}
                            onPress={() => setEndDate(null)}
                          >
                            <Text style={styles.clearButtonText}>✕</Text>
                          </Pressable>
                        )}
                      </View>

                      {/* Date Pickers */}
                      {showStartDatePicker && (
                        <>
                          <DateTimePicker
                            value={startDate || new Date()}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleStartDateChange}
                            textColor="#0d9488"
                          />
                          {Platform.OS === 'ios' && (
                            <Pressable
                              style={styles.datePickerConfirmButton}
                              onPress={() => setShowStartDatePicker(false)}
                            >
                              <Text style={styles.datePickerConfirmText}>Tamam</Text>
                            </Pressable>
                          )}
                        </>
                      )}

                      {showEndDatePicker && (
                        <>
                          <DateTimePicker
                            value={endDate || new Date()}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleEndDateChange}
                            textColor="#0d9488"
                          />
                          {Platform.OS === 'ios' && (
                            <Pressable
                              style={styles.datePickerConfirmButton}
                              onPress={() => setShowEndDatePicker(false)}
                            >
                              <Text style={styles.datePickerConfirmText}>Tamam</Text>
                            </Pressable>
                          )}
                        </>
                      )}
                    </>
                  )}
                </View>
              )}

              {/* Category-Specific Fields */}
              {category === 'FOOD_PLACE' && (
                <View style={cardStyle}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.sectionEmoji}>🍽️</Text>
                    <Text style={styles.sectionTitle}>Restoran Bilgileri</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Mutfak türü (örn. İtalyan, Türk...)"
                    placeholderTextColor="#9ca3af"
                    value={mealType}
                    onChangeText={setMealType}
                    editable={!isSubmitting}
                  />
                  <TextInput
                    style={[styles.input, { marginTop: 8 }]}
                    placeholder="Fiyat aralığı (örn. €€€, $$$$...)"
                    placeholderTextColor="#9ca3af"
                    value={priceRange}
                    onChangeText={setPriceRange}
                    editable={!isSubmitting}
                  />
                </View>
              )}

              {category === 'HOTEL' && (
                <View style={cardStyle}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.sectionEmoji}>🏨</Text>
                    <Text style={styles.sectionTitle}>Otel Bilgileri</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Fiyat aralığı (örn. €€€, $$$$...)"
                    placeholderTextColor="#9ca3af"
                    value={priceRange}
                    onChangeText={setPriceRange}
                    editable={!isSubmitting}
                  />
                  <TextInput
                    style={[styles.input, { marginTop: 8 }]}
                    placeholder="Tesisler (virgülle ayrılmış)"
                    placeholderTextColor="#9ca3af"
                    value={amenities}
                    onChangeText={setAmenities}
                    editable={!isSubmitting}
                    multiline
                  />
                </View>
              )}

              {category === 'ATTRACTION' && (
                <View style={cardStyle}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.sectionEmoji}>🏛️</Text>
                    <Text style={styles.sectionTitle}>Mekan Bilgileri</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Açılış saatleri (örn. 09:00-18:00)"
                    placeholderTextColor="#9ca3af"
                    value={hours}
                    onChangeText={setHours}
                    editable={!isSubmitting}
                  />
                </View>
              )}

              {/* Multi-Criteria Rating Sliders */}
              <View style={cardStyle}>
                <MultiCriteriaRatingSliders
                  onRatingsChange={setRatings}
                  initialValues={ratings}
                />
              </View>
            </View>
          )}

          {/* STEP 3: Media & Review */}
          {currentStep === 3 && (
            <View style={styles.stepContainer}>
              <View style={styles.titleArea}>
                <Text style={styles.stepTitle}>📸 Medya ve İnceleme</Text>
                <Text style={styles.stepSubtitle}>Görüntüleri yükleyin ve paylaşımınızı gözden geçirin</Text>
              </View>

              {/* Image Uploader */}
              <View style={cardStyle}>
                <View style={styles.cardHeader}>
                  <Text style={styles.sectionEmoji}>📸</Text>
                  <Text style={styles.sectionTitle}>Görüntüler *</Text>
                </View>
                <ImageUploader
                  onImagesUploaded={setUploadedImages}
                  maxImages={10}
                  token={token ?? undefined}
                />
                {uploadedImages.length > 0 && (
                  <View style={styles.imageCountBadge}>
                    <Text style={styles.imageCountText}>✓ {uploadedImages.length} görüntü yüklendi</Text>
                  </View>
                )}
              </View>

              {/* Review Summary */}
              <View style={cardStyle}>
                <View style={styles.cardHeader}>
                  <Text style={styles.sectionEmoji}>✅</Text>
                  <Text style={styles.sectionTitle}>Paylaşımınızı Gözden Geçirin</Text>
                </View>

                {/* Category & Features Badge */}
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Category:</Text>
                  <View style={styles.badgeContainer}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{category}</Text>
                    </View>
                  </View>
                </View>

                {selectedFeatures.length > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Features:</Text>
                    <View style={styles.badgeContainer}>
                      {selectedFeatures.map((feature) => (
                        <View key={feature} style={styles.badge}>
                          <Text style={styles.badgeText}>{feature}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Locations Badge */}
                {selectedLocations.length > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Konumlar:</Text>
                    <View style={styles.badgeContainer}>
                      {selectedLocations.slice(0, 3).map((location) => (
                        <View key={location.name} style={styles.badge}>
                          <Text style={styles.badgeText}>{location.name}</Text>
                        </View>
                      ))}
                      {selectedLocations.length > 3 && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>+{selectedLocations.length - 3}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* Ratings Badge */}
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Derecelendirmeler:</Text>
                  <View style={styles.badgeContainer}>
                    <View style={styles.ratingBadge}>
                      <Text style={styles.ratingBadgeEmoji}>✨</Text>
                      <Text style={styles.ratingBadgeText}>{ratings.cleanliness}/5</Text>
                    </View>
                    <View style={styles.ratingBadge}>
                      <Text style={styles.ratingBadgeEmoji}>👥</Text>
                      <Text style={styles.ratingBadgeText}>{ratings.service}/5</Text>
                    </View>
                    <View style={styles.ratingBadge}>
                      <Text style={styles.ratingBadgeEmoji}>💰</Text>
                      <Text style={styles.ratingBadgeText}>{ratings.pricePerformance}/5</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Navigation Buttons */}
          <View style={styles.navigationContainer}>
            <Pressable
              style={[styles.navButton, styles.navButtonSecondary, currentStep === 1 && styles.navButtonDisabled]}
              onPress={goPreviousStep}
              disabled={currentStep === 1 || isSubmitting}
            >
              <Text style={[styles.navButtonText, styles.navButtonSecondaryText]}>← Önceki</Text>
            </Pressable>

            {currentStep < 3 ? (
              <Pressable
                style={[styles.navButton, styles.navButtonPrimary]}
                onPress={goNextStep}
                disabled={isSubmitting}
              >
                <Text style={styles.navButtonText}>Sonraki →</Text>
              </Pressable>
            ) : (
              <Pressable
                style={[styles.navButton, styles.navButtonSuccess, isSubmitting && styles.navButtonDisabled]}
                onPress={handleCreatePost}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={styles.navButtonText}>Yayınlanıyor...</Text>
                  </>
                ) : (
                  <Text style={styles.navButtonText}>📤 Yayınla</Text>
                )}
              </Pressable>
            )}
          </View>
        </ScrollView>
      </PageShell>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  stepContainer: {
    marginBottom: 24,
  },
  titleArea: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  titleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0d9488',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#0f766e',
    fontWeight: '500',
    lineHeight: 20,
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
    borderRadius: 20,
    backgroundColor: '#f0fdf9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ccf0e8',
  },
  exitButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f766e',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#991b1b',
  },
  layout: {
    flexDirection: 'column',
    gap: 16,
    paddingHorizontal: 16,
  },
  layoutWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  fullWidthCard: {
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionEmoji: {
    fontSize: 22,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f766e',
  },
  selectedLocationBadge: {
    backgroundColor: '#e0f7f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  selectedLocationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0d9488',
  },
  imageCountBadge: {
    backgroundColor: '#e0f7f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  imageCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0d9488',
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
  },
  ratingButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  ratingButtonActive: {
    backgroundColor: '#e0f7f5',
    borderColor: '#0d9488',
  },
  ratingButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b7280',
  },
  ratingButtonTextActive: {
    color: '#0d9488',
  },
  ratingBadge: {
    backgroundColor: '#e0f7f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  ratingBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0d9488',
  },
  ratingBadgeEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: '#f9fafb',
    color: '#0f172a',
    marginBottom: 12,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: '#f9fafb',
    color: '#0f172a',
    minHeight: 140,
    textAlignVertical: 'top',
  },
  textAreaWide: {
    minHeight: 150,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: '#f9fafb',
    color: '#0f172a',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: '#f9fafb',
    color: '#0f172a',
  },
  dateSeperator: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f766e',
  },
  navigationContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  navButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  navButtonPrimary: {
    backgroundColor: '#0d9488',
  },
  navButtonSecondary: {
    backgroundColor: '#e5e7eb',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  navButtonSecondaryText: {
    color: '#374151',
  },
  navButtonSuccess: {
    backgroundColor: '#10b981',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  primaryButtonEmoji: {
    fontSize: 16,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#e0f2fe',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#0ea5e9',
  },
  secondaryButtonText: {
    color: '#0369a1',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryButtonEmoji: {
    fontSize: 16,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  summaryRow: {
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    backgroundColor: '#e0f7f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0d9488',
  },
  dateHint: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  dateInputRow: {
    marginBottom: 12,
  },
  dateWebLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f766e',
    marginBottom: 6,
  },
  webDateInput: {
    backgroundColor: '#f0fdf9',
    borderWidth: 2,
    borderColor: '#0d9488',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#0d9488',
    fontWeight: '600',
  },
  webDateButton: {
    backgroundColor: '#f0fdf9',
    borderWidth: 2,
    borderColor: '#0d9488',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  webDateButtonText: {
    fontSize: 14,
    color: '#0d9488',
    fontWeight: '600',
    textAlign: 'center',
  },
  webDateButtonPlaceholder: {
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  calendarContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    overflow: 'auto' as any,
  },
  datePickerContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  dateButton: {
    backgroundColor: '#f0fdf9',
    borderWidth: 2,
    borderColor: '#0d9488',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateButtonEmoji: {
    fontSize: 20,
  },
  dateButtonContent: {
    flex: 1,
  },
  dateButtonLabel: {
    fontSize: 12,
    color: '#0f766e',
    fontWeight: '600',
    marginBottom: 2,
  },
  dateButtonValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0d9488',
  },
  dateButtonValueEmpty: {
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  dateButtonChevron: {
    fontSize: 20,
    color: '#0d9488',
    fontWeight: '300',
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#dc2626',
    fontWeight: '700',
    fontSize: 14,
  },
  datePickerConfirmButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#0d9488',
    borderRadius: 8,
    alignItems: 'center',
  },
  datePickerConfirmText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
})

