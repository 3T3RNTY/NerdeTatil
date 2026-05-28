import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import ImageUploader from './ImageUploader';
import MultiCriteriaRatingSliders from './MultiCriteriaRatingSliders';
import { tokens } from '@/src/theme/tokens'
import { LocationData, MultiCriteriaRatings, PostType } from '@/src/api/postService';

interface UploadedImage {
  url: string;
  publicId: string;
  filename?: string;
}

interface ReviewAndRatingProps {
  onReviewChange: (review: string) => void;
  onImagesChange: (images: UploadedImage[]) => void;
  onRatingsChange: (ratings: {
    optionVariety: number;
    location: number;
    accessibility: number;
    priceValue: number;
  }) => void;
  onTitleChange: (title: string) => void;
  onLocationRatingChange?: (locationIndex: number, rating: number) => void;
  onLocationDescriptionChange?: (locationIndex: number, description: string) => void;
  onLocationMultiCriteriaChange?: (locationIndex: number, ratings: MultiCriteriaRatings) => void;
  title: string;
  review: string;
  images: UploadedImage[];
  ratings: {
    optionVariety: number;
    location: number;
    accessibility: number;
    priceValue: number;
  };
  token?: string | null;
  selectedLocations?: LocationData[];
  postType?: PostType;
}

export function ReviewAndRating({
  onReviewChange,
  onImagesChange,
  onRatingsChange,
  onTitleChange,
  onLocationRatingChange,
  onLocationDescriptionChange,
  onLocationMultiCriteriaChange,
  title,
  review,
  images,
  ratings,
  token,
  selectedLocations = [],
  postType = 'LOCATION',
}: ReviewAndRatingProps) {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [expandedLocationIndex, setExpandedLocationIndex] = useState<number | null>(null);

  const handleTitleChange = (text: string) => {
    onTitleChange(text);
  };

  const handleReviewChange = (text: string) => {
    onReviewChange(text);
    if (text.trim().length >= 10) {
      setValidationError(null);
    }
  };

  const handleImagesChange = (newImages: UploadedImage[]) => {
    if (newImages.length < 1) {
      setValidationError('En az 1 fotoğraf yükleyin');
    } else if (newImages.length > 20) {
      setValidationError('En fazla 20 fotoğraf yükleyebilirsiniz');
    } else {
      setValidationError(null);
    }
    onImagesChange(newImages);
  };

  const handleRatingsChange = (newRatings: any) => {
    onRatingsChange(newRatings);
  };

  const handleLocationRating = (locationIndex: number, rating: number) => {
    if (onLocationRatingChange) {
      onLocationRatingChange(locationIndex, rating);
    }
  };

  const handleLocationDescription = (locationIndex: number, description: string) => {
    if (onLocationDescriptionChange) {
      onLocationDescriptionChange(locationIndex, description);
    }
  };

  const handleLocationMultiCriteria = (locationIndex: number, newRatings: MultiCriteriaRatings) => {
    if (onLocationMultiCriteriaChange) {
      onLocationMultiCriteriaChange(locationIndex, newRatings);
    }
  };

  const renderLocationRatingCard = (location: LocationData, index: number) => {
    const isExpanded = expandedLocationIndex === index;
    const hasRating = location.rating !== undefined;

    return (
      <View key={index} style={styles.locationCard}>
        <Pressable
          style={styles.locationCardHeader}
          onPress={() => setExpandedLocationIndex(isExpanded ? null : index)}
        >
          <View style={styles.locationInfo}>
            <Text style={styles.locationName} numberOfLines={1}>
              {location.name}
            </Text>
            {location.address && (
              <Text style={styles.locationAddress} numberOfLines={1}>
                {location.address}
              </Text>
            )}
            {hasRating && (
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingBadgeText}>
                  ⭐ {location.rating?.toFixed(1)}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.expandIcon}>
            {isExpanded ? '▼' : '▶'}
          </Text>
        </Pressable>

        {isExpanded && (
          <View style={styles.locationRatingContainer}>
            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>Bu konum için genel puanı</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable
                    key={star}
                    onPress={() => handleLocationRating(index, star)}
                    style={styles.starButton}
                  >
                    <Text style={styles.star}>
                      {star <= (location.rating || 0) ? '⭐' : '☆'}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.ratingValue}>
                {location.rating ? `${location.rating} / 5` : 'Seçiniz'}
              </Text>
            </View>

            <View style={styles.descriptionSection}>
              <Text style={styles.ratingLabel}>Bu konum hakkında yorum (isteğe bağlı)</Text>
              <TextInput
                style={styles.descriptionInput}
                placeholder="Bu konumun deneyiminiz hakkında yorum yazın..."
                placeholderTextColor={tokens.colors.textTertiary}
                value={location.description || ''}
                onChangeText={(text) => handleLocationDescription(index, text)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.multiCriteriaSection}>
              <Text style={styles.ratingLabel}>Detaylı puanlama</Text>
              <MultiCriteriaRatingSliders
                ratings={(location.multiCriteriaRatings || {
                  optionVariety: 3,
                  location: 3,
                  accessibility: 3,
                  priceValue: 3,
                }) as any}
                onRatingsChange={(newRatings) => handleLocationMultiCriteria(index, newRatings)}
              />
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Başlık</Text>

      <TextInput
        style={styles.titleInput}
        placeholder="Paylaşımınız için başlık girin"
        placeholderTextColor={tokens.colors.textTertiary}
        value={title}
        onChangeText={handleTitleChange}
        maxLength={100}
      />

      <Text style={styles.charCount}>
        {title.length} / 100
      </Text>

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Genel Yorumunuz</Text>

      <TextInput
        style={styles.reviewInput}
        placeholder="En az 10 karakter ile deneyiminizi anlatın..."
        placeholderTextColor={tokens.colors.textTertiary}
        value={review}
        onChangeText={handleReviewChange}
        multiline
        numberOfLines={5}
        textAlignVertical="top"
      />
      <Text style={styles.charCount}>
        {review.length} / {review.length >= 10 ? '✓' : 'min 10'}
      </Text>

      {/* Location Ratings - Only for TRIP posts */}
      {postType === 'TRIP' && selectedLocations.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Konumları Puanlandır</Text>
          <Text style={styles.helperText}>
            Her konum için puan verin ve yorumlar ekleyin (isteğe bağlı)
          </Text>
          {selectedLocations.map((location, index) => renderLocationRatingCard(location, index))}
        </>
      )}

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Fotoğraf Yükle</Text>
      <Text style={styles.helperText}>En az 1, en fazla 20 fotoğraf</Text>

      <ImageUploader onImagesUploaded={handleImagesChange} maxImages={20} token={token} />

      {images.length > 0 && (
        <View style={styles.imagePreview}>
          <Text style={styles.imageCountText}>
            Yüklenen fotoğraf: {images.length}/20
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageGallery}
          >
            {images.map((image, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: image.url }} style={styles.thumbnail} />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Genel Puanlandır</Text>

      <MultiCriteriaRatingSliders
        ratings={ratings as any}
        onRatingsChange={handleRatingsChange}
      />

      {validationError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{validationError}</Text>
        </View>
      )}
    </ScrollView>
  );
}
  

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.text,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: tokens.colors.textSecondary,
    marginBottom: 12,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: tokens.colors.text,
    backgroundColor: tokens.colors.backgroundSecondary,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: tokens.colors.text,
    backgroundColor: tokens.colors.backgroundSecondary,
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: tokens.colors.textSecondary,
    marginTop: 4,
    textAlign: 'right',
  },
  // Location rating styles
  locationCard: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: tokens.colors.backgroundSecondary,
  },
  locationCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  locationInfo: {
    flex: 1,
    marginRight: 8,
  },
  locationName: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.text,
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 12,
    color: tokens.colors.textSecondary,
    marginBottom: 4,
  },
  ratingBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: tokens.colors.primary + '20',
    borderRadius: 4,
  },
  ratingBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: tokens.colors.primary,
  },
  expandIcon: {
    fontSize: 12,
    color: tokens.colors.textSecondary,
  },
  locationRatingContainer: {
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: tokens.colors.background,
  },
  ratingSection: {
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: tokens.colors.text,
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  starButton: {
    padding: 4,
  },
  star: {
    fontSize: 28,
  },
  ratingValue: {
    fontSize: 12,
    color: tokens.colors.textSecondary,
    fontWeight: '500',
  },
  descriptionSection: {
    marginBottom: 16,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: 6,
    padding: 10,
    fontSize: 13,
    color: tokens.colors.text,
    backgroundColor: tokens.colors.backgroundSecondary,
    minHeight: 80,
  },
  multiCriteriaSection: {
    marginTop: 12,
  },
  imagePreview: {
    marginTop: 16,
    paddingBottom: 8,
  },
  imageCountText: {
    fontSize: 13,
    fontWeight: '500',
    color: tokens.colors.text,
    marginBottom: 8,
  },
  imageGallery: {
    flexDirection: 'row',
    gap: 8,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 8,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  errorContainer: {
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
});
