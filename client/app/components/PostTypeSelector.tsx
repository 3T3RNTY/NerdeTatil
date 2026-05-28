import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { tokens } from '@/src/theme/tokens'

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
    color: tokens.colors.text,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: tokens.colors.backgroundTertiary,
    borderWidth: 2,
    borderColor: tokens.colors.borderLight,
    alignItems: 'center',
    gap: 8,
  },
  cardSelected: {
    backgroundColor: tokens.colors.infoLight,
    borderColor: tokens.colors.infoPrimary,
  },
  emoji: {
    fontSize: 36,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.text,
  },
  cardDescription: {
    fontSize: 12,
    color: tokens.colors.textSecondary,
    textAlign: 'center',
  },
});
