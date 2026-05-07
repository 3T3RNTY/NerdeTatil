import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Pressable,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { LocationData } from '@/src/api/postService';
import { tokens } from '@/src/theme/tokens';

// Web date picker imports
let DayPicker: any = null
if (Platform.OS === 'web') {
  try {
    const module = require('react-day-picker')
    DayPicker = module.DayPicker
    require('react-day-picker/dist/style.css')
  } catch (e) {
    // Fallback if module not available
  }
}

interface MultiLocationPickerProps {
  onLocationsSelect: (locations: LocationData[]) => void;
  maxLocations?: number;
}

interface LocationSearchResult {
  latitude: number;
  longitude: number;
  address: string;
  city?: string;
  country?: string;
}

const MultiLocationPicker: React.FC<MultiLocationPickerProps> = ({
  onLocationsSelect,
  maxLocations = 10,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<number | null>(null);
  const [showWebCalendar, setShowWebCalendar] = useState<number | null>(null);
  const [visitDates, setVisitDates] = useState<{ [key: number]: Date | null }>({});

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
  const handleSelectFromResults = (location: LocationSearchResult) => {
    if (selectedLocations.length >= maxLocations) {
      Alert.alert('Limit Reached', `You can only add up to ${maxLocations} locations`);
      return;
    }

    const newLocation: LocationData = {
      name: location.address.split(',')[0] || location.address,
      address: location.address,
      city: location.city,
      country: location.country,
      latitude: location.latitude,
      longitude: location.longitude,
    };

    const newLocations = [...selectedLocations, newLocation];
    setSelectedLocations(newLocations);
    onLocationsSelect(newLocations);
    setShowResults(false);
    setSearchQuery('');
  };

  // Remove location from selected list
  const handleRemoveLocation = (index: number) => {
    const newLocations = selectedLocations.filter((_, i) => i !== index);
    const newDates = { ...visitDates };
    delete newDates[index];
    setSelectedLocations(newLocations);
    setVisitDates(newDates);
    onLocationsSelect(newLocations);
  };

  // Update visit date for a location
  const handleSetDate = (index: number, date: Date | null) => {
    const newDates = { ...visitDates, [index]: date };
    setVisitDates(newDates);
    const newLocations = selectedLocations.map((loc, i) => 
      i === index ? { ...loc, visitDate: date ? date.toISOString() : undefined } : loc
    );
    setSelectedLocations(newLocations);
    onLocationsSelect(newLocations);
    setShowDatePicker(null);
    setShowWebCalendar(null);
  };

  const handleDatePickerChange = (event: DateTimePickerEvent, selectedDate?: Date, locationIndex?: number) => {
    if (locationIndex === undefined) return;
    
    if (event.type === 'set' && selectedDate) {
      handleSetDate(locationIndex, selectedDate);
    }
    
    if (Platform.OS === 'android' || event.type === 'dismissed') {
      setShowDatePicker(null);
    }
  };

  const formatDateForDisplay = (date: Date | null | undefined) => {
    if (!date) return 'Tarih seç';
    return date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Konum ara..."
          placeholderTextColor="#9ca3af"
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
            <Text style={styles.searchButtonText}>Ara</Text>
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

      {/* Selected Locations List */}
      {selectedLocations.length > 0 && (
        <View style={styles.selectedListContainer}>
          <Text style={styles.selectedListTitle}>📍 Seçilen Konumlar ({selectedLocations.length}/{maxLocations})</Text>
          <ScrollView style={styles.selectedList}>
            {selectedLocations.map((location, index) => (
              <View key={index} style={styles.selectedItem}>
                <View style={styles.selectedItemContent}>
                  <Text style={styles.selectedItemNumber}>{index + 1}.</Text>
                  <View style={styles.selectedItemInfo}>
                    <Text style={styles.selectedItemAddress}>{location.name || location.address}</Text>
                    <Text style={styles.selectedItemCity}>
                      {location.city && `${location.city}, `}
                      {location.country}
                    </Text>
                    {location.visitDate && (
                      <Text style={styles.visitDateDisplay}>Tarih: {location.visitDate}</Text>
                    )}
                  </View>
                  <Pressable
                    style={styles.removeButton}
                    onPress={() => handleRemoveLocation(index)}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </Pressable>
                </View>
                
                {/* Date Picker for this location */}
                <View style={styles.dateInputContainer}>
                  {Platform.OS === 'web' ? (
                    /* Web: Calendar picker */
                    <>
                      <Pressable
                        style={styles.webDateButton}
                        onPress={() => setShowWebCalendar(showWebCalendar === index ? null : index)}
                      >
                        <Text style={[styles.webDateButtonText, !visitDates[index] && styles.webDateButtonPlaceholder]}>
                          📅 {formatDateForDisplay(visitDates[index])}
                        </Text>
                      </Pressable>
                      {showWebCalendar === index && DayPicker && (
                        <View style={styles.calendarContainer}>
                          <DayPicker
                            mode="single"
                            selected={visitDates[index]}
                            onSelect={(date) => handleSetDate(index, date)}
                          />
                        </View>
                      )}
                    </>
                  ) : (
                    /* Mobile: Date picker button */
                    <>
                      <Pressable
                        style={styles.mobileeDateButton}
                        onPress={() => setShowDatePicker(index)}
                      >
                        <Text style={[styles.mobileeDateButtonText, !visitDates[index] && styles.mobileeDateButtonPlaceholder]}>
                          📅 {formatDateForDisplay(visitDates[index])}
                        </Text>
                      </Pressable>
                      {showDatePicker === index && (
                        <>
                          <DateTimePicker
                            value={visitDates[index] || new Date()}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={(event, date) => handleDatePickerChange(event, date, index)}
                            textColor="#0d9488"
                          />
                          {Platform.OS === 'ios' && (
                            <Pressable
                              style={styles.datePickerDoneButton}
                              onPress={() => setShowDatePicker(null)}
                            >
                              <Text style={styles.datePickerDoneText}>Done</Text>
                            </Pressable>
                          )}
                        </>
                      )}
                    </>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Info Message */}
      {selectedLocations.length === 0 && searchResults.length === 0 && !showResults && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Konum eklemek için ara ve sonuçlardan seç
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccf0e8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f0fdf9',
    color: '#0f766e',
  },
  searchButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  resultsList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ccf0e8',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f0fdf9',
  },
  resultItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0f2fe',
  },
  resultAddress: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f766e',
    marginBottom: 4,
  },
  resultCoordinates: {
    fontSize: 12,
    color: '#6b7280',
  },
  selectedListContainer: {
    marginTop: 16,
    backgroundColor: '#d1fae5',
    borderWidth: 2,
    borderColor: '#10b981',
    borderRadius: 8,
    padding: 12,
  },
  selectedListTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#047857',
    marginBottom: 12,
  },
  selectedList: {
    maxHeight: 300,
  },
  selectedItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  selectedItemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  selectedItemNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
    minWidth: 24,
  },
  selectedItemInfo: {
    flex: 1,
  },
  selectedItemAddress: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f766e',
    marginBottom: 2,
  },
  selectedItemCity: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  visitDateDisplay: {
    fontSize: 11,
    color: '#10b981',
    fontStyle: 'italic',
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#dc2626',
  },
  dateInputContainer: {
    marginTop: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ccf0e8',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    backgroundColor: '#f0fdf9',
    color: '#0f766e',
  },
  webDateButton: {
    backgroundColor: '#f0fdf9',
    borderWidth: 1,
    borderColor: '#ccf0e8',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  webDateButtonText: {
    fontSize: 12,
    color: '#0f766e',
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
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    overflowY: 'auto' as any,
  },
  mobileeDateButton: {
    backgroundColor: '#f0fdf9',
    borderWidth: 1,
    borderColor: '#ccf0e8',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  mobileeDateButtonText: {
    fontSize: 12,
    color: '#0f766e',
    fontWeight: '600',
    textAlign: 'center',
  },
  mobileeDateButtonPlaceholder: {
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  datePickerDoneButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#10b981',
    borderRadius: 6,
    alignItems: 'center',
  },
  datePickerDoneText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
  },
  infoContainer: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#ccf0e8',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#0f766e',
    textAlign: 'center',
  },
});

export default MultiLocationPicker;
