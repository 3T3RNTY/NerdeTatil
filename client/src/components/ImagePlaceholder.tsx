import type { StyleProp, ViewStyle } from 'react-native'
import { StyleSheet, Text, View } from 'react-native'
import { tokens } from '@/src/theme/tokens'

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
    borderRadius: tokens.borderRadius.xl,
    backgroundColor: tokens.colors.borderLight,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing[1],
  },
  compact: {
    minHeight: 120,
  },
  icon: {
    fontSize: tokens.typography.fontSize['2xl'],
  },
  label: {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.primary,
    fontWeight: tokens.typography.fontWeight.semibold as any,
  },
})
