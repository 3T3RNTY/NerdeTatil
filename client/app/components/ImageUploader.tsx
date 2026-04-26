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
      Alert.alert('Error', 'Failed to pick images');
      console.error('Image picker error:', error);
    }
  }, [maxImages, uploadedImages.length, selectedImages]);

  // Upload selected images
  const handleUploadImages = useCallback(async () => {
    if (selectedImages.length === 0) {
      Alert.alert('No images', 'Please select images to upload');
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
            throw new Error('Failed to fetch image');
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
              error: data.message || 'Upload failed',
            });
          }
        } catch (error) {
          errors.push({
            filename,
            error: error instanceof Error ? error.message : 'Upload error',
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
          'Partial upload',
          `${uploadedResults.length} images uploaded, ${errors.length} failed`
        );
      } else {
        Alert.alert('Success', `${uploadedResults.length} images uploaded`);
      }
    } catch (error) {
      Alert.alert('Error', 'Upload failed');
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

  const canAddMore = uploadedImages.length + selectedImages.length < maxImages;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Upload Images</Text>

      {/* Add Images Button */}
      <TouchableOpacity
        style={addButtonStyle}
        onPress={handlePickImages}
        disabled={!canAddMore || isUploading}
      >
        <Text style={styles.addButtonText}>
          {canAddMore ? '+ Add Images' : 'Max images reached'}
        </Text>
      </TouchableOpacity>

      {/* Selected Images Preview */}
      {selectedImages.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Selected Images ({selectedImages.length})
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
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.uploadButtonText}>
                  Uploading {Math.round(uploadProgress)}%
                </Text>
              </>
            ) : (
              <Text style={styles.uploadButtonText}>Upload Images</Text>
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
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  imagePreview: {
    position: 'relative',
    marginRight: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff3b30',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonUploaded: {
    backgroundColor: '#ff9500',
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  uploadButton: {
    backgroundColor: '#34C759',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  uploadButtonDisabled: {
    backgroundColor: '#ccc',
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  errorsSection: {
    backgroundColor: '#fee',
    borderWidth: 1,
    borderColor: '#fcc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  errorTitle: {
    fontWeight: '600',
    color: '#c33',
    marginBottom: 6,
  },
  errorMessage: {
    color: '#c33',
    fontSize: 12,
    marginBottom: 4,
  },
  infoContainer: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
});

export default ImageUploader;
