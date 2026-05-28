import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import Toast from 'react-native-toast-message';
import { AppHeader } from '@/src/components/AppHeader';
import { PageShell } from '@/src/components/PageShell';
import { useAuth } from '@/src/hooks/useAuth';
import ProgressStepper from './components/ProgressStepper';
import { PostTypeSelector } from './components/PostTypeSelector';
import { ThemeSelector } from './components/ThemeSelector';
import { SubThemeSelector } from './components/SubThemeSelector';
import { ReviewAndRating } from './components/ReviewAndRating';
import MultiLocationPicker from './components/MultiLocationPicker';
import { PostService, LocationData, PostType } from '@/src/api/postService';
import { tokens } from '@/src/theme/tokens';

interface UploadedImage {
  url: string;
  publicId: string;
}

export default function YeniPaylasimScreen() {
  const router = useRouter();
  const { user, token } = useAuth();

  // Redirect if not authenticated
  if (!user) {
    Alert.alert('Uyarı', 'Paylaşım yapmak için giriş yapmalısınız', [
      { text: 'Tamam', onPress: () => router.push('/login') },
    ]);
    return null;
  }

  // Step navigation state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form state
  const [postType, setPostType] = useState<PostType | undefined>(undefined);
  const [themeId, setThemeId] = useState<string | undefined>(undefined);
  const [subThemeIds, setSubThemeIds] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [review, setReview] = useState('');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<LocationData[]>([]);
  const [ratings, setRatings] = useState({
    optionVariety: 3,
    location: 3,
    accessibility: 3,
    priceValue: 3,
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Step validation
  const canProceedToNext = (): boolean => {
    setFormError('');

    if (currentStep === 1) {
      if (!postType) {
        setFormError('Lütfen bir tür seçin');
        return false;
      }
      return true;
    }

    if (currentStep === 2) {
      if (!themeId) {
        setFormError('Lütfen bir tema seçin');
        return false;
      }
      return true;
    }

    if (currentStep === 3) {
      if (subThemeIds.length === 0) {
        setFormError('Lütfen en az bir alt tema seçin');
        return false;
      }
      if (selectedLocations.length === 0) {
        setFormError('Lütfen en az bir konum seçin');
        return false;
      }
      if (postType === 'LOCATION' && selectedLocations.length !== 1) {
        setFormError('Tek konum seçimi için tam olarak 1 konum seçin');
        return false;
      }
      if (postType === 'TRIP' && selectedLocations.length < 2) {
        setFormError('Seyahat için en az 2 konum seçin');
        return false;
      }
      return true;
    }

    if (currentStep === 4) {
      if (title.trim().length < 1) {
        setFormError('Başlık gerekli');
        return false;
      }
      if (review.trim().length < 10) {
        setFormError('Yorum en az 10 karakter olmalı');
        return false;
      }
      if (uploadedImages.length < 1 || uploadedImages.length > 20) {
        setFormError('1-20 arası fotoğraf yükleyin');
        return false;
      }
      if (
        !ratings.optionVariety ||
        !ratings.location ||
        !ratings.accessibility ||
        !ratings.priceValue
      ) {
        setFormError('Lütfen tüm puanlamalar yapın');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (canProceedToNext()) {
      if (currentStep < 4) {
        setCurrentStep((currentStep + 1) as 1 | 2 | 3 | 4);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as 1 | 2 | 3 | 4);
      setFormError('');
    }
  };

  const handleSubmit = async () => {
    if (!canProceedToNext()) {
      return;
    }

    if (!user || !postType || !themeId) {
      setFormError('Form eksik');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError('');

      const post = await PostService.createPost({
        userId: user.id,
        postType,
        themeId,
        subThemeIds,
        title,
        description: review,
        locations: selectedLocations,
        imageUrls: uploadedImages.map((img) => img.url),
        multiCriteriaRatings: ratings,
      });

      Toast.show({
        type: 'success',
        text1: 'Başarı',
        text2: 'Paylaşımınız yayınlandı',
      });

      router.push({
        pathname: '/detay/[id]',
        params: { id: post.id },
      });
    } catch (error: any) {
      console.error('Error creating post:', error);
      setFormError(
        error.error ||
          error.message ||
          'Paylaşım oluşturma başarısız oldu'
      );
      Toast.show({
        type: 'error',
        text1: 'Hata',
        text2: formError,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell>
      <AppHeader />

      <View style={styles.container}>
        <ProgressStepper currentStep={currentStep} />

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Step 1: Post Type */}
          {currentStep === 1 && (
            <PostTypeSelector
              selectedType={postType}
              onSelect={setPostType}
            />
          )}

          {/* Step 2: Theme */}
          {currentStep === 2 && (
            <ThemeSelector
              selectedThemeId={themeId}
              onSelect={setThemeId}
            />
          )}

          {/* Step 3: Sub-themes & Locations */}
          {currentStep === 3 && themeId && (
            <View>
              <SubThemeSelector
                themeId={themeId}
                selectedSubThemeIds={subThemeIds}
                onSelect={setSubThemeIds}
              />

              <View style={styles.locationSection}>
                <Text style={styles.sectionTitle}>
                  {postType === 'TRIP'
                    ? 'En az 2 konum seç'
                    : 'Tek konum seç'}
                </Text>
                <MultiLocationPicker
                  onLocationsSelect={setSelectedLocations}
                  maxLocations={postType === 'TRIP' ? 10 : 1}
                />
              </View>
            </View>
          )}

          {/* Step 4: Review & Rating */}
          {currentStep === 4 && (
            <ReviewAndRating
              title={title}
              onTitleChange={setTitle}
              review={review}
              onReviewChange={setReview}
              images={uploadedImages}
              onImagesChange={setUploadedImages}
              ratings={ratings}
              onRatingsChange={setRatings}
              token={token}
            />
          )}

          {/* Error Message */}
          {formError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{formError}</Text>
            </View>
          )}
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          {currentStep > 1 && (
            <Pressable
              style={styles.secondaryButton}
              onPress={handleBack}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>Geri</Text>
            </Pressable>
          )}

          {currentStep < 4 ? (
            <Pressable
              style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
              onPress={handleNext}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                  <ActivityIndicator color={tokens.colors.background} />
                ) : (
                  <Text style={styles.buttonText}>İleri</Text>
                )}
            </Pressable>
          ) : (
            <Pressable
              style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={tokens.colors.background} />
              ) : (
                <Text style={styles.buttonText}>Paylaşımı Yayınla</Text>
              )}
            </Pressable>
          )}
        </View>
      </View>
    </PageShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  locationSection: {
    marginTop: 24,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.borderLight,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.text,
    marginBottom: 12,
  },
  errorContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: tokens.colors.errorLight,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: tokens.colors.error,
  },
  errorText: {
    color: tokens.colors.error,
    fontSize: 13,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.borderLight,
    backgroundColor: tokens.colors.backgroundSecondary,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: tokens.colors.infoPrimary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: tokens.colors.borderLight,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.background,
  },
});
