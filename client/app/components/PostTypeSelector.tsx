import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface PostTypeSelectorProps {
  onSelect: (postType: 'TRIP' | 'LOCATION') => void;
  selectedType?: 'TRIP' | 'LOCATION';
}

export function PostTypeSelector({ onSelect, selectedType }: PostTypeSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seyahat Türünü Seç</Text>

      <Pressable
        style={[
          styles.card,
          selectedType === 'TRIP' && styles.cardSelected,
        ]}
        onPress={() => onSelect('TRIP')}
      >
        <Text style={styles.emoji}>🗺️</Text>
        <Text style={styles.cardTitle}>Seyahat</Text>
        <Text style={styles.cardDescription}>Birden fazla konumdan bahset</Text>
      </Pressable>

      <Pressable
        style={[
          styles.card,
          selectedType === 'LOCATION' && styles.cardSelected,
        ]}
        onPress={() => onSelect('LOCATION')}
      >
        <Text style={styles.emoji}>📍</Text>
        <Text style={styles.cardTitle}>Konum</Text>
        <Text style={styles.cardDescription}>Tek bir konumdan bahset</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1f2937',
  },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    gap: 8,
  },
  cardSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  emoji: {
    fontSize: 36,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  cardDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});
