import type { ReactNode } from 'react'
import { ScrollView, StyleSheet, useWindowDimensions, View, Platform } from 'react-native'

type PageShellProps = {
  children: ReactNode
  withScroll?: boolean
}

export function PageShell({ children, withScroll = true }: PageShellProps) {
  const { width } = useWindowDimensions()
  const isMobile = Platform.OS !== 'web'
  const horizontalPadding = width >= 1200 ? 28 : width >= 768 ? 22 : 16
  const bottomPadding = isMobile ? 70 : 0
  const flattenedStyle = StyleSheet.flatten([
    styles.container,
    { paddingHorizontal: horizontalPadding, paddingBottom: bottomPadding },
  ])

  if (!withScroll) {
    return <View style={flattenedStyle}>{children}</View>
  }

  return (
    <ScrollView
      contentContainerStyle={flattenedStyle}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
    marginHorizontal: 'auto' as any,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
})
