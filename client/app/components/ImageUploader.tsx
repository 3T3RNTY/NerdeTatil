import React, { useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { tokens } from '@/src/theme/tokens';

interface UploadedImage {
  url: string;
  publicId: string;
  filename?: string;
}

interface UploadError {
  filename: string;
  error: string;
}

interface ImageUploaderProps {
  onImagesUploaded: (images: UploadedImage[]) => void;
  maxImages?: number;
  token?: string;
}

// Helper function to get MIME type from filename
const getMimeType = (filename: string): string => {
  const ext = filename.toLowerCase().split('.').pop() || '';
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'bmp': 'image/bmp',
    'svg': 'image/svg+xml',
  };
  return mimeTypes[ext] || 'image/jpeg';
};

/**
 * ImageUploader - Component for uploading multiple images to Cloudinary via backend
 */
const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImagesUploaded,
  maxImages = 10,
  token,
}) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<UploadError[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const canAddMore = uploadedImages.length + selectedImages.length < maxImages;
  const removeButtonStyle = StyleSheet.flatten([styles.removeButton, styles.removeButtonUploaded])
  const addButtonStyle = StyleSheet.flatten([styles.addButton, !canAddMore && styles.addButtonDisabled])
  const uploadButtonStyle = StyleSheet.flatten([styles.uploadButton, isUploading && styles.uploadButtonDisabled])

  // Request permission and pick images
  const handlePickImages = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera roll permission required');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const newImages = result.assets.slice(0, maxImages - uploadedImages.length);
        setSelectedImages([...selectedImages, ...newImages]);
      }
    } catch (error) {
      Alert.alert('Hata', 'Görüntüleri seçmek başarısız oldu');
      console.error('Image picker error:', error);
    }
  }, [maxImages, uploadedImages.length, selectedImages]);

  // Upload selected images
  const handleUploadImages = useCallback(async () => {
    if (selectedImages.length === 0) {
      Alert.alert('Görüntü yok', 'Lütfen yüklemek için görüntüleri seçin');
      return;
    }

    setIsUploading(true);
    setUploadErrors([]);
    const uploadedResults: UploadedImage[] = [];
    const errors: UploadError[] = [];

    try {
      for (let i = 0; i < selectedImages.length; i++) {
        const image = selectedImages[i];
        const filename = image.uri.split('/').pop() || `image_${i}`;

        try {
          // Fetch image from URI and convert to Blob
          const imageResponse = await fetch(image.uri);
          if (!imageResponse.ok) {
            throw new Error('Görüntü alınalamadı');
          }
          const blob = await imageResponse.blob();

          // Create FormData with Blob
          const formData = new FormData();
          formData.append('image', blob, filename);

          // Upload to backend
          const response = await fetch(
            'http://localhost:5000/api/images/upload',
            {
              method: 'POST',
              headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: formData,
            }
          );

          const data = await response.json();

          if (data.success && data.data.url) {
            uploadedResults.push({
              url: data.data.url,
              publicId: data.data.publicId,
              filename,
            });
          } else {
            errors.push({
              filename,
              error: data.message || 'Yükleme başarısız',
            });
          }
        } catch (error) {
          errors.push({
            filename,
            error: error instanceof Error ? error.message : 'Yükleme hatası',
          });
        }

        // Update progress
        setUploadProgress(((i + 1) / selectedImages.length) * 100);
      }

      // Save uploaded images
      const allImages = [...uploadedImages, ...uploadedResults];
      setUploadedImages(allImages);
      onImagesUploaded(allImages);
      setSelectedImages([]);
      setUploadProgress(0);

      if (errors.length > 0) {
        setUploadErrors(errors);
        Alert.alert(
          'Kısmi yükleme',
          `${uploadedResults.length} görüntü yüklendi, ${errors.length} başarısız`
        );
      } else {
        Alert.alert('Başarı', `${uploadedResults.length} görüntü yüklendi`);
      }
    } catch (error) {
      Alert.alert('Hata', 'Yükleme başarısız');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [selectedImages, token, uploadedImages, onImagesUploaded]);

  // Remove image from uploaded list
  const handleRemoveImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    onImagesUploaded(newImages);
  };

  // Remove image from selected list
  const handleRemoveSelected = (index: number) => {
    const newSelected = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newSelected);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Görüntüleri Yükle</Text>

      {/* Add Images Button */}
      <TouchableOpacity
        style={addButtonStyle}
        onPress={handlePickImages}
        disabled={!canAddMore || isUploading}
      >
        <Text style={styles.addButtonText}>
          {canAddMore ? '+ Görüntü Ekle' : 'Maksimum görüntüsü ulaştı'}
        </Text>
      </TouchableOpacity>

      {/* Selected Images Preview */}
      {selectedImages.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Seçilen Görüntüler ({selectedImages.length})
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedImages.map((image, index) => (
              <View key={index} style={styles.imagePreview}>
                <Image
                  source={{ uri: image.uri }}
                  style={styles.previewImage}
                />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveSelected(index)}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* Upload Button */}
          <TouchableOpacity
            style={uploadButtonStyle}
            onPress={handleUploadImages}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <ActivityIndicator color={tokens.colors.background} size="small" />
                <Text style={styles.uploadButtonText}>
                  Yükleniyor {Math.round(uploadProgress)}%
                </Text>
              </>
            ) : (
              <Text style={styles.uploadButtonText}>Görüntüleri Yükle</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Upload Errors */}
      {uploadErrors.length > 0 && (
        <View style={styles.errorsSection}>
          <Text style={styles.errorTitle}>Upload Errors:</Text>
          {uploadErrors.map((error, index) => (
            <Text key={index} style={styles.errorMessage}>
              • {error.filename}: {error.error}
            </Text>
          ))}
        </View>
      )}

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Uploaded Images ({uploadedImages.length}/{maxImages})
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {uploadedImages.map((image, index) => (
              <View key={index} style={styles.imagePreview}>
                <Image
                  source={{ uri: image.url }}
                  style={styles.previewImage}
                />
                <TouchableOpacity
                  style={removeButtonStyle}
                  onPress={() => handleRemoveImage(index)}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Info Message */}
      {uploadedImages.length === 0 && selectedImages.length === 0 && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Select and upload images to add to your post (max {maxImages})
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: tokens.spacing[5],
    paddingHorizontal: tokens.spacing[4],
  },
  label: {
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.semibold as any,
    marginBottom: tokens.spacing[3],
    color: tokens.colors.text,
  },
  addButton: {
    backgroundColor: tokens.colors.primary,
    paddingVertical: tokens.spacing[3],
    borderRadius: tokens.borderRadius.base,
    alignItems: 'center',
    marginBottom: tokens.spacing[3],
  },
  addButtonDisabled: {
    backgroundColor: tokens.colors.border,
  },
  addButtonText: {
    color: tokens.colors.background,
    fontWeight: tokens.typography.fontWeight.semibold as any,
    fontSize: tokens.typography.fontSize.sm,
  },
  section: {
    marginBottom: tokens.spacing[4],
  },
  sectionTitle: {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.semibold as any,
    color: tokens.colors.text,
    marginBottom: tokens.spacing[2],
  },
  imagePreview: {
    position: 'relative',
    marginRight: tokens.spacing[2],
    borderRadius: tokens.borderRadius.base,
    overflow: 'hidden',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: tokens.borderRadius.base,
    backgroundColor: tokens.colors.backgroundSecondary,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: tokens.colors.error,
    borderRadius: tokens.borderRadius.full,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonUploaded: {
    backgroundColor: tokens.colors.warning,
  },
  removeButtonText: {
    color: tokens.colors.background,
    fontWeight: tokens.typography.fontWeight.bold as any,
    fontSize: tokens.typography.fontSize.lg,
  },
  uploadButton: {
    backgroundColor: tokens.colors.success,
    paddingVertical: tokens.spacing[3],
    borderRadius: tokens.borderRadius.base,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: tokens.spacing[2],
    gap: tokens.spacing[2],
  },
  uploadButtonDisabled: {
    backgroundColor: tokens.colors.border,
  },
  uploadButtonText: {
    color: tokens.colors.background,
    fontWeight: tokens.typography.fontWeight.semibold as any,
    fontSize: tokens.typography.fontSize.sm,
  },
  errorsSection: {
    backgroundColor: tokens.colors.errorLight,
    borderWidth: 1,
    borderColor: tokens.colors.error,
    borderRadius: tokens.borderRadius.base,
    padding: tokens.spacing[2],
    marginBottom: tokens.spacing[3],
  },
  errorTitle: {
    fontWeight: tokens.typography.fontWeight.semibold as any,
    color: tokens.colors.error,
    marginBottom: tokens.spacing[1],
  },
  errorMessage: {
    color: tokens.colors.error,
    fontSize: tokens.typography.fontSize.xs,
    marginBottom: tokens.spacing[1],
  },
  infoContainer: {
    backgroundColor: tokens.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.borderRadius.base,
    padding: tokens.spacing[3],
    marginTop: tokens.spacing[3],
  },
  infoText: {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.textSecondary,
    textAlign: 'center',
  },
});

export default ImageUploader;
