import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';

interface ImageGalleryProps {
  images: string[];
  onImagePress?: (imageIndex: number) => void;
}

/**
 * ImageGallery - Component for displaying multiple images with carousel navigation
 */
const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  onImagePress,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const screenWidth = Dimensions.get('window').width;

  if (!images || images.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No images available</Text>
      </View>
    );
  }

  // Navigate to previous image
  const handlePrev = () => {
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    scrollViewRef.current?.scrollTo({
      x: newIndex * screenWidth,
      animated: true,
    });
  };

  // Navigate to next image
  const handleNext = () => {
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    scrollViewRef.current?.scrollTo({
      x: newIndex * screenWidth,
      animated: true,
    });
  };

  // Handle scroll end
  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / screenWidth);
    if (index !== currentIndex && index < images.length) {
      setCurrentIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      {/* Main Carousel */}
      <View style={styles.carouselContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          snapToInterval={screenWidth}
          decelerationRate="fast"
        >
          {images.map((image, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.imageContainer, { width: screenWidth }]}
              onPress={() => onImagePress?.(index)}
            >
              <Image
                source={{ uri: image }}
                style={styles.image}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <TouchableOpacity
              style={[styles.arrowButton, styles.leftArrow]}
              onPress={handlePrev}
            >
              <Text style={styles.arrowText}>{'<'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.arrowButton, styles.rightArrow]}
              onPress={handleNext}
            >
              <Text style={styles.arrowText}>{'>'}</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <View style={styles.counterContainer}>
            <Text style={styles.counterText}>
              {currentIndex + 1} / {images.length}
            </Text>
          </View>
        )}
      </View>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thumbnailsContainer}
          contentContainerStyle={styles.thumbnailsContent}
        >
          {images.map((image, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.thumbnail,
                index === currentIndex && styles.thumbnailActive,
              ]}
              onPress={() => {
                setCurrentIndex(index);
                scrollViewRef.current?.scrollTo({
                  x: index * screenWidth,
                  animated: true,
                });
              }}
            >
              <Image
                source={{ uri: image }}
                style={styles.thumbnailImage}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  carouselContainer: {
    position: 'relative',
    height: 300,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  imageContainer: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  arrowButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  leftArrow: {
    left: 10,
  },
  rightArrow: {
    right: 10,
  },
  arrowText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  counterContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  counterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  thumbnailsContainer: {
    height: 80,
  },
  thumbnailsContent: {
    paddingHorizontal: 5,
    gap: 8,
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
  },
  thumbnailActive: {
    borderColor: '#007AFF',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  emptyContainer: {
    height: 300,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
});

export default ImageGallery;
