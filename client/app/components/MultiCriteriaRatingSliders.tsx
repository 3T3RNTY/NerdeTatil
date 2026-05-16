import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useState } from 'react'
import { tokens } from '@/src/theme/tokens'

interface MultiCriteriaRatingValues {
  cleanliness: number
  service: number
  pricePerformance: number
}

interface MultiCriteriaRatingSlidersProps {
  onRatingsChange: (ratings: MultiCriteriaRatingValues) => void
  initialValues?: MultiCriteriaRatingValues
}

const criteria = [
  { key: 'cleanliness', label: 'Temizlik', emoji: '✨' },
  { key: 'service', label: 'Hizmet', emoji: '👥' },
  { key: 'pricePerformance', label: 'Fiyat/Değer', emoji: '💰' },
]

const ratingLabels = ['Kötü', 'Uygun', 'İyi', 'Çok İyi', 'Mükemmel']

export default function MultiCriteriaRatingSliders({
  onRatingsChange,
  initialValues = { cleanliness: 3, service: 3, pricePerformance: 3 },
}: MultiCriteriaRatingSlidersProps) {
  const [ratings, setRatings] = useState<MultiCriteriaRatingValues>(initialValues)

  const handleSliderChange = (key: keyof MultiCriteriaRatingValues, value: number) => {
    const newRatings = { ...ratings, [key]: value }
    setRatings(newRatings)
    onRatingsChange(newRatings)
  }

  const renderSlider = (key: keyof MultiCriteriaRatingValues, label: string, emoji: string) => {
    const currentValue = ratings[key]

    return (
      <View key={key} style={styles.sliderContainer}>
        <View style={styles.sliderHeader}>
          <View style={styles.labelRow}>
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={styles.label}>{label}</Text>
          </View>
          <View style={styles.valueBadge}>
            <Text style={styles.valueBadgeText}>{currentValue}/5</Text>
          </View>
        </View>

        {/* Clickable Slider: 5 tap targets */}
        <View style={styles.sliderTrack}>
          {[1, 2, 3, 4, 5].map((value) => (
            <Pressable
              key={value}
              style={styles.sliderSegmentWrapper}
              onPress={() => handleSliderChange(key, value)}
            >
              <View
                style={[
                  styles.sliderSegment,
                  value <= currentValue && styles.sliderSegmentActive,
                ]}
              />
            </Pressable>
          ))}
        </View>

        {/* Label below slider */}
        <Text style={styles.ratingLabel}>{ratingLabels[currentValue - 1]}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Deneyiminizi Değerlendirin</Text>
      <View style={styles.divider} />

      {criteria.map((item) =>
        renderSlider(
          item.key as keyof MultiCriteriaRatingValues,
          item.label,
          item.emoji
        )
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: tokens.spacing[3],
  },
  title: {
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text,
    marginBottom: tokens.spacing[3],
  },
  divider: {
    height: 1,
    backgroundColor: tokens.colors.border,
    marginBottom: tokens.spacing[4],
  },
  sliderContainer: {
    marginBottom: tokens.spacing[5],
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing[3],
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
  },
  emoji: {
    fontSize: tokens.typography.fontSize.lg,
  },
  label: {
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text,
  },
  valueBadge: {
    backgroundColor: tokens.colors.primaryLight,
    paddingHorizontal: tokens.spacing[2],
    paddingVertical: tokens.spacing[1],
    borderRadius: tokens.borderRadius.md,
  },
  valueBadgeText: {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.primary,
  },
  sliderTrack: {
    flexDirection: 'row',
    gap: tokens.spacing[1],
    marginBottom: tokens.spacing[2],
    height: 40,
    alignItems: 'center',
  },
  sliderSegmentWrapper: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderSegment: {
    flex: 1,
    width: '100%',
    backgroundColor: tokens.colors.backgroundTertiary,
    borderRadius: tokens.borderRadius.md,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  sliderSegmentActive: {
    backgroundColor: tokens.colors.primary,
    borderColor: tokens.colors.primary,
  },
  ratingLabel: {
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: tokens.typography.fontWeight.medium,
    color: tokens.colors.textSecondary,
    marginLeft: tokens.spacing[1],
  },
})
