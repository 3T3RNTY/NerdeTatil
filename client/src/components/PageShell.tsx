import type { ReactNode } from 'react'
import { ScrollView, StyleSheet, useWindowDimensions, View, Platform } from 'react-native'
import { tokens } from '@/src/theme/tokens'

/*
* PageShell component - a layout wrapper for pages that provides consistent padding and max width. Can optionally include a ScrollView for scrollable content. Adjusts padding based on screen size and platform (mobile vs web).
*/

type PageShellProps = {
  children: ReactNode
  withScroll?: boolean
}

export function PageShell({ children, withScroll = true }: PageShellProps) {
  const { width } = useWindowDimensions()
  const isMobile = Platform.OS !== 'web'
  
  // Responsive padding based on breakpoints from tokens
  const horizontalPadding = 
    width >= tokens.breakpoints.desktop ? tokens.spacing[7] :
    width >= tokens.breakpoints.tablet ? tokens.spacing[6] :
    tokens.spacing[4]
  
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

/*
* Styles for PageShell component - defines the container style with max width and centering. Additional padding is applied dynamically based on screen size and platform.
*/

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    marginHorizontal: 'auto' as any,
    paddingVertical: tokens.spacing[4],
    gap: tokens.spacing[4],
  },
})
