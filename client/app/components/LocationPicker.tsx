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
            <ActivityIndicator color="#fff" size="small" />
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
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  resultsList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  resultItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultAddress: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  resultCoordinates: {
    fontSize: 12,
    color: '#666',
  },
  selectedContainer: {
    backgroundColor: '#f0f7ff',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  selectedLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  selectedContent: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 6,
  },
  selectedAddress: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  selectedDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  coordinates: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
    marginBottom: 10,
  },
  clearButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
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

export default LocationPicker;
