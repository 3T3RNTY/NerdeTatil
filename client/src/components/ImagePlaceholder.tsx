import type { StyleProp, ViewStyle } from 'react-native'
import { StyleSheet, Text, View } from 'react-native'

type ImagePlaceholderProps = {
  compact?: boolean
  style?: StyleProp<ViewStyle>
}

export function ImagePlaceholder({ compact = false, style }: ImagePlaceholderProps) {
  return (
    <View style={[styles.box, compact && styles.compact, style]}>
      <Text style={styles.icon}>🖼</Text>
      <Text style={styles.label}>Gorsel</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  box: {
    minHeight: 180,
    borderRadius: 18,
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  compact: {
    minHeight: 120,
  },
  icon: {
    fontSize: 30,
  },
  label: {
    fontSize: 14,
    color: '#1e3a8a',
    fontWeight: '600',
  },
})
