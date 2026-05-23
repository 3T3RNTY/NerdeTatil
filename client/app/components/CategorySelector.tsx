import { Pressable, StyleSheet, Text, View } from 'react-native'

// Legacy PostCategory for backward compatibility
type PostCategory = 'TRIP' | 'FOOD_PLACE' | 'HOTEL' | 'ATTRACTION'

interface CategoryOption {
  value: PostCategory
  label: string
  emoji: string
  description: string
}

interface CategorySelectorProps {
  selected: PostCategory | null
  onSelect: (category: PostCategory) => void
}

const CATEGORIES: CategoryOption[] = [
  {
    value: 'TRIP',
    label: 'Seyahat',
    emoji: '✈️',
    description: 'Çok konumlı, çok günlük seyahatler',
  },
  {
    value: 'FOOD_PLACE',
    label: 'Yemek Yeri',
    emoji: '🍽️',
    description: 'Restoran ve kafeler',
  },
  {
    value: 'HOTEL',
    label: 'Otel',
    emoji: '🏨',
    description: 'Konaklama seçenekleri',
  },
  {
    value: 'ATTRACTION',
    label: 'Mekan',
    emoji: '🏛️',
    description: 'Yerler ve mekanlar',
  },
]

export default function CategorySelector({ selected, onSelect }: CategorySelectorProps) {
  return (
    <View style={styles.container}>
      {CATEGORIES.map((category) => {
        const isSelected = selected === category.value
        const buttonStyle = StyleSheet.flatten([
          styles.categoryButton,
          isSelected && styles.categoryButtonActive,
        ])
        const labelStyle = StyleSheet.flatten([
          styles.categoryLabel,
          isSelected && styles.categoryLabelActive,
        ])

        return (
          <Pressable
            key={category.value}
            style={buttonStyle}
            onPress={() => onSelect(category.value)}
          >
            <Text style={styles.categoryEmoji}>{category.emoji}</Text>
            <Text style={labelStyle}>{category.label}</Text>
            <Text style={styles.categoryDesc}>{category.description}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginVertical: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f0fdf9',
    borderWidth: 2,
    borderColor: '#ccf0e8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryButtonActive: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f766e',
    flex: 1,
  },
  categoryLabelActive: {
    color: '#047857',
  },
  categoryDesc: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 8,
  },
})
