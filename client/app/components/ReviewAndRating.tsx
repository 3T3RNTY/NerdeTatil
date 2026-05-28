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
}

export function ReviewAndRating({
  onReviewChange,
  onImagesChange,
  onRatingsChange,
  onTitleChange,
  title,
  review,
  images,
  ratings,
  token,
}: ReviewAndRatingProps) {
  const [validationError, setValidationError] = useState<string | null>(null);

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

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Puanlandır</Text>

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
