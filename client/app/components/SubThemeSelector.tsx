import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { PostService } from '@/src/api/postService';

interface SubTheme {
  id: string;
  name: string;
}

interface SubThemeSelectorProps {
  themeId: string;
  selectedSubThemeIds: string[];
  onSelect: (subThemeIds: string[]) => void;
}

export function SubThemeSelector({
  themeId,
  selectedSubThemeIds,
  onSelect,
}: SubThemeSelectorProps) {
  const [subThemes, setSubThemes] = useState<SubTheme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubThemes();
  }, [themeId]);

  const loadSubThemes = async () => {
    try {
      setLoading(true);
      const themes = await PostService.getThemes();
      const selectedTheme = themes.find((t: any) => t.id === themeId);
      if (selectedTheme) {
        setSubThemes(selectedTheme.subThemes);
      }
    } catch (err) {
      console.error('Error loading sub-themes:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSubTheme = (subThemeId: string) => {
    if (selectedSubThemeIds.includes(subThemeId)) {
      onSelect(selectedSubThemeIds.filter((id) => id !== subThemeId));
    } else {
      onSelect([...selectedSubThemeIds, subThemeId]);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Alt Temalar Seç</Text>

      <View style={styles.chipsContainer}>
        {subThemes && subThemes.length > 0 && subThemes.map((subTheme) => (
          <Pressable
            key={subTheme.id}
            style={[
              styles.chip,
              selectedSubThemeIds.includes(subTheme.id) && styles.chipSelected,
            ]}
            onPress={() => toggleSubTheme(subTheme.id)}
          >
            <Text
              style={[
                styles.chipText,
                selectedSubThemeIds.includes(subTheme.id) && styles.chipTextSelected,
              ]}
            >
              {subTheme.name}
            </Text>
          </Pressable>
        ))}
      </View>

      {(!subThemes || subThemes.length === 0) && (
        <Text style={styles.emptyText}>Alt tema bulunamadı</Text>
      )}

      {selectedSubThemeIds.length > 0 && (
        <View style={styles.reviewSection}>
          <Text style={styles.reviewTitle}>Seçtiğiniz Konular</Text>
          <View style={styles.selectedChips}>
            {selectedSubThemeIds.map((id) => {
              const subTheme = subThemes.find((st) => st.id === id);
              return (
                <View key={id} style={styles.reviewChip}>
                  <Text style={styles.reviewChipText}>{subTheme?.name}</Text>
                  <Pressable onPress={() => toggleSubTheme(id)}>
                    <Text style={styles.removeIcon}>×</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
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
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1f2937',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  chipSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  chipText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: 'white',
  },
  reviewSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  selectedChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reviewChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#dbeafe',
    borderRadius: 20,
    gap: 6,
  },
  reviewChipText: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '500',
  },
  removeIcon: {
    fontSize: 18,
    color: '#1e40af',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 20,
  },
});
