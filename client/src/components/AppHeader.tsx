import { Link, usePathname } from 'expo-router'
import { Platform, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native'
import { env } from '@/src/config/env'
import { tokens } from '@/src/theme/tokens'

export function AppHeader() {
  const { width } = useWindowDimensions()
  const isWide = width >= 900
  const isMobile = Platform.OS !== 'web'
  const pathname = usePathname()
  const isProfilePage = pathname === '/profil'
  const searchStyle = StyleSheet.flatten([styles.search, isWide && styles.searchWide])

  return (
    <View style={styles.header}>
      <View style={styles.inner}>
        {isMobile ? (
          // Mobile: Show brand only
          <Link href="/" asChild>
            <Pressable>
              <Text style={styles.brand}>🌍 {env.appName}</Text>
            </Pressable>
          </Link>
        ) : isWide ? (
          // Wide Web: Show brand
          <Link href="/" asChild>
            <Pressable>
              <Text style={styles.brand}>🌍 {env.appName}</Text>
            </Pressable>
          </Link>
        ) : null}
        <TextInput
          style={searchStyle}
          placeholder="Mekan, şehir veya tatil ara..."
          placeholderTextColor={tokens.colors.textTertiary}
        />
        {!isMobile && (
          <Link href={isProfilePage ? '/' : '/profil'} asChild>
            <Pressable style={styles.profileButton}>
              <Text style={styles.profileEmoji}>{isProfilePage ? '🏠' : '👤'}</Text>
              {isWide ? <Text style={styles.profileText}>{isProfilePage ? 'Ana Sayfa' : 'Profil'}</Text> : null}
            </Pressable>
          </Link>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.secondaryLight,
    backgroundColor: tokens.colors.primaryLighter,
    paddingTop: Platform.OS === 'web' ? tokens.spacing[3] : tokens.spacing[5],
    shadowColor: tokens.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[4],
    paddingBottom: tokens.spacing[3],
  },
  brand: {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.bold as any,
    color: tokens.colors.primary,
    marginRight: tokens.spacing[1],
  },
  search: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.borderRadius.lg,
    paddingHorizontal: tokens.spacing[4],
    fontSize: tokens.typography.fontSize.base,
    color: tokens.colors.text,
    backgroundColor: tokens.colors.secondaryLighter,
    fontWeight: tokens.typography.fontWeight.medium as any,
  },
  searchWide: {
    maxWidth: 680,
  },
  profileButton: {
    height: 44,
    borderRadius: tokens.borderRadius.lg,
    paddingHorizontal: tokens.spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
    borderWidth: 1,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.secondaryLighter,
  },
  profileEmoji: {
    fontSize: tokens.typography.fontSize.base,
  },
  profileText: {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.primary,
    fontWeight: tokens.typography.fontWeight.bold as any,
  },
})
