import type { ReactNode } from 'react'
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native'

type PageShellProps = {
  children: ReactNode
  withScroll?: boolean
}

export function PageShell({ children, withScroll = true }: PageShellProps) {
  const { width } = useWindowDimensions()
  const horizontalPadding = width >= 1200 ? 28 : width >= 768 ? 22 : 16

  if (!withScroll) {
    return <View style={[styles.container, { paddingHorizontal: horizontalPadding }]}>{children}</View>
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingHorizontal: horizontalPadding }]}
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
})
