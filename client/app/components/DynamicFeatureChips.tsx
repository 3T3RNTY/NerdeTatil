import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import { useState } from 'react'
import { PostCategory } from '@/src/api/postService'
import { tokens } from '@/src/theme/tokens'

interface DynamicFeatureChipsProps {
  category: PostCategory | null
  selectedFeatures?: string[]
  onFeaturesSelect: (features: string[]) => void
}

const featuresByCategory: Record<PostCategory, string[]> = {
  HOTEL: ['Ücretsiz WiFi', 'Havuz', 'Evcil Hayvan Dostça', 'Spor Salonu', 'Spa', 'Restoran', 'Klima', 'Otopark'],
  FOOD_PLACE: ['Vegan Seçenekler', 'Canlı Müzik', 'Açık Alan', 'Teslimat', 'Paket Servis', 'Çocuk Menüsü', 'Halal', 'Rezervasyon'],
  ATTRACTION: ['Rehberli Turlar', 'Fotoğrafçılık İzin', 'Tekerlekli Sandalye Erişimi', 'Ses Rehberi', 'Hatıra Dükkanı', 'Kafe', 'Otopark', 'Aile Dostça'],
  TRIP: ['Kamp', 'Macera Sporları', 'Plaj', 'Dağ', 'Kültürel', 'Yemek Turu', 'Gece Yaşantısı', 'Alışveriş'],
}

export default function DynamicFeatureChips({
  category,
  selectedFeatures = [],
  onFeaturesSelect,
}: DynamicFeatureChipsProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedFeatures))

  if (!category || !featuresByCategory[category]) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>Mevcut özellikleri görmek için bir kategori seçin</Text>
      </View>
    )
  }

  const features = featuresByCategory[category]

  const toggleFeature = (feature: string) => {
    const newSelected = new Set(selected)
    if (newSelected.has(feature)) {
      newSelected.delete(feature)
    } else {
      newSelected.add(feature)
    }
    setSelected(newSelected)
    onFeaturesSelect(Array.from(newSelected))
  }

  return (
    <View style={styles.container}>
      <View style={styles.selectedCountBadge}>
        <Text style={styles.selectedCountText}>
          {selected.size} {selected.size === 1 ? 'özellik' : 'özellik'} seçildi
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chipContainer}
      >
        {features.map((feature) => {
          const isSelected = selected.has(feature)
          return (
            <Pressable
              key={feature}
              style={[
                styles.chip,
                isSelected && styles.chipSelected,
              ]}
              onPress={() => toggleFeature(feature)}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected && styles.chipTextSelected,
                ]}
              >
                {feature}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: tokens.spacing[2],
  },
  emptyState: {
    paddingVertical: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[3],
    backgroundColor: tokens.colors.backgroundTertiary,
    borderRadius: tokens.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.textSecondary,
    fontWeight: tokens.typography.fontWeight.medium,
  },
  selectedCountBadge: {
    backgroundColor: tokens.colors.primaryLight,
    paddingHorizontal: tokens.spacing[3],
    paddingVertical: tokens.spacing[2],
    borderRadius: tokens.borderRadius.md,
    marginBottom: tokens.spacing[3],
    alignSelf: 'flex-start',
  },
  selectedCountText: {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.primary,
  },
  chipScroll: {
    marginHorizontal: -tokens.spacing[4],
    paddingHorizontal: tokens.spacing[4],
  },
  chipContainer: {
    gap: tokens.spacing[2],
    paddingBottom: tokens.spacing[2],
  },
  chip: {
    paddingHorizontal: tokens.spacing[3],
    paddingVertical: tokens.spacing[2],
    borderRadius: tokens.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.background,
    minWidth: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: tokens.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  chipSelected: {
    backgroundColor: tokens.colors.primary,
    borderColor: tokens.colors.primary,
  },
  chipText: {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.textSecondary,
  },
  chipTextSelected: {
    color: tokens.colors.background,
  },
})
