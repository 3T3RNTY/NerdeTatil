import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { PostService } from '@/src/api/postService';

interface Theme {
  id: string;
  name: string;
  emoji: string;
  description: string;
  subThemes: Array<{ id: string; name: string }>;
}

interface ThemeSelectorProps {
  onSelect: (themeId: string) => void;
  selectedThemeId?: string;
}

export function ThemeSelector({ onSelect, selectedThemeId }: ThemeSelectorProps) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadThemes();
  }, []);

  const loadThemes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await PostService.getThemes();
      setThemes(data);
    } catch (err) {
      console.error('Error loading themes:', err);
      setError('Temalar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={loadThemes}>
          <Text style={styles.retryButtonText}>Yeniden Dene</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Tema Seç</Text>

      {themes && themes.length > 0 && themes.map((theme) => (
        <Pressable
          key={theme.id}
          style={[
            styles.card,
            selectedThemeId === theme.id && styles.cardSelected,
          ]}
          onPress={() => onSelect(theme.id)}
        >
          <Text style={styles.emoji}>{theme.emoji}</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{theme.name}</Text>
            <Text style={styles.cardDescription}>{theme.description}</Text>
          </View>
        </Pressable>
      ))}

      {(!themes || themes.length === 0) && (
        <Text style={styles.emptyText}>Tema bulunamadı</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1f2937',
  },
  card: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    gap: 12,
  },
  cardSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  emoji: {
    fontSize: 28,
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  cardDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  error: {
    color: '#dc2626',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 20,
  },
});
