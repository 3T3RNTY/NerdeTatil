import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { tokens } from '@/src/theme/tokens';
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
        <ActivityIndicator size="large" color={tokens.colors.infoPrimary} />
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
    color: tokens.colors.text,
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
    backgroundColor: tokens.colors.backgroundTertiary,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  chipSelected: {
    backgroundColor: tokens.colors.infoPrimary,
    borderColor: tokens.colors.infoPrimary,
  },
  chipText: {
    fontSize: 13,
    color: tokens.colors.text,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: tokens.colors.background,
  },
  reviewSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.borderLight,
    gap: 12,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.text,
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
    backgroundColor: tokens.colors.infoLight,
    borderRadius: 20,
    gap: 6,
  },
  reviewChipText: {
    fontSize: 12,
    color: tokens.colors.infoPrimary,
    fontWeight: '500',
  },
  removeIcon: {
    fontSize: 18,
    color: tokens.colors.infoPrimary,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: tokens.colors.textTertiary,
    fontSize: 14,
    marginTop: 20,
  },
});
