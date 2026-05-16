import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { tokens } from '@/src/theme/tokens';

interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city?: string;
  country?: string;
}

interface LocationPickerProps {
  onLocationSelect: (location: Location) => void;
  initialLocation?: Location;
}

/**
 * LocationPicker - Component for selecting location via search or map
 * For web: Uses Leaflet map
 * For mobile: Fallback to search-based selection
 */
const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    initialLocation || null
  );
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Search for locations
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/locations/search?q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.data);
        setShowResults(true);
      } else {
        Alert.alert('Error', data.error || 'Search failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to search locations');
      console.error('Location search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  // Handle location selection from search results
  const handleSelectFromResults = (location: Location) => {
    setSelectedLocation(location);
    setShowResults(false);
    onLocationSelect(location);
  };

  // Handle clear selection
  const handleClearSelection = () => {
    setSelectedLocation(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Location</Text>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for location or address..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          editable={!isSearching}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={isSearching}
        >
          {isSearching ? (
            <ActivityIndicator color={tokens.colors.background} size="small" />
          ) : (
            <Text style={styles.searchButtonText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Results */}
      {showResults && searchResults.length > 0 && (
        <ScrollView style={styles.resultsList}>
          {searchResults.map((result, index) => (
            <TouchableOpacity
              key={index}
              style={styles.resultItem}
              onPress={() => handleSelectFromResults(result)}
            >
              <Text style={styles.resultAddress}>{result.address}</Text>
              <Text style={styles.resultCoordinates}>
                {result.city && `${result.city}, `}
                {result.country}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Selected Location Display */}
      {selectedLocation && (
        <View style={styles.selectedContainer}>
          <Text style={styles.selectedLabel}>Selected Location:</Text>
          <View style={styles.selectedContent}>
            <Text style={styles.selectedAddress}>{selectedLocation.address}</Text>
            <Text style={styles.selectedDetails}>
              {selectedLocation.city && `${selectedLocation.city}, `}
              {selectedLocation.country}
            </Text>
            <Text style={styles.coordinates}>
              Coordinates: {selectedLocation.latitude.toFixed(4)},{' '}
              {selectedLocation.longitude.toFixed(4)}
            </Text>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearSelection}
            >
              <Text style={styles.clearButtonText}>Clear Selection</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Info Message */}
      {!selectedLocation && searchResults.length === 0 && !showResults && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Search for a location by name or address to get started.
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
  searchContainer: {
    flexDirection: 'row',
    marginBottom: tokens.spacing[3],
    gap: tokens.spacing[2],
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.borderRadius.base,
    paddingHorizontal: tokens.spacing[3],
    paddingVertical: tokens.spacing[2],
    fontSize: tokens.typography.fontSize.sm,
    backgroundColor: tokens.colors.background,
  },
  searchButton: {
    backgroundColor: tokens.colors.primary,
    paddingHorizontal: tokens.spacing[4],
    borderRadius: tokens.borderRadius.base,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: tokens.colors.background,
    fontWeight: tokens.typography.fontWeight.semibold as any,
  },
  resultsList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.borderRadius.base,
    marginBottom: tokens.spacing[3],
    backgroundColor: tokens.colors.background,
  },
  resultItem: {
    paddingHorizontal: tokens.spacing[3],
    paddingVertical: tokens.spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderLight,
  },
  resultAddress: {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium as any,
    color: tokens.colors.text,
    marginBottom: tokens.spacing[1],
  },
  resultCoordinates: {
    fontSize: tokens.typography.fontSize.xs,
    color: tokens.colors.textSecondary,
  },
  selectedContainer: {
    backgroundColor: tokens.colors.primaryLighter,
    borderWidth: 2,
    borderColor: tokens.colors.primary,
    borderRadius: tokens.borderRadius.base,
    padding: tokens.spacing[3],
    marginTop: tokens.spacing[3],
  },
  selectedLabel: {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.semibold as any,
    color: tokens.colors.primary,
    marginBottom: tokens.spacing[2],
  },
  selectedContent: {
    backgroundColor: tokens.colors.background,
    padding: tokens.spacing[2],
    borderRadius: tokens.borderRadius.sm,
  },
  selectedAddress: {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium as any,
    color: tokens.colors.text,
    marginBottom: tokens.spacing[1],
  },
  selectedDetails: {
    fontSize: tokens.typography.fontSize.xs,
    color: tokens.colors.textSecondary,
    marginBottom: tokens.spacing[1],
  },
  coordinates: {
    fontSize: tokens.typography.fontSize.xs,
    color: tokens.colors.textTertiary,
    fontFamily: 'monospace',
    marginBottom: tokens.spacing[2],
  },
  clearButton: {
    backgroundColor: tokens.colors.error,
    paddingVertical: tokens.spacing[2],
    paddingHorizontal: tokens.spacing[3],
    borderRadius: tokens.borderRadius.sm,
    alignItems: 'center',
    marginTop: tokens.spacing[2],
  },
  clearButtonText: {
    color: tokens.colors.background,
    fontWeight: tokens.typography.fontWeight.semibold as any,
    fontSize: tokens.typography.fontSize.xs,
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

export default LocationPicker;
