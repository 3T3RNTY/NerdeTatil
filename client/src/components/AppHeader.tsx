import { Link, usePathname } from 'expo-router'
import { Platform, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native'
import { env } from '@/src/config/env'

export function AppHeader() {
  const { width } = useWindowDimensions()
  const isWide = width >= 900
  const pathname = usePathname()
  const isProfilePage = pathname === '/profil'
  const searchStyle = StyleSheet.flatten([styles.search, isWide && styles.searchWide])

  return (
    <View style={styles.header}>
      <View style={styles.inner}>
        {isWide ? (
          <Link href="/" asChild>
            <Pressable>
              <Text style={styles.brand}>🌍 {env.appName}</Text>
            </Pressable>
          </Link>
        ) : null}
        <TextInput
          style={searchStyle}
          placeholder="Mekan, şehir veya tatil ara..."
          placeholderTextColor="#9ca3af"
        />
        <Link href={isProfilePage ? '/' : '/profil'} asChild>
          <Pressable style={styles.profileButton}>
            <Text style={styles.profileEmoji}>{isProfilePage ? '🏠' : '👤'}</Text>
            {isWide ? <Text style={styles.profileText}>{isProfilePage ? 'Ana Sayfa' : 'Profil'}</Text> : null}
          </Pressable>
        </Link>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#d1f3ed',
    backgroundColor: '#f0fdf9',
    paddingTop: Platform.OS === 'web' ? 12 : 18,
    shadowColor: '#0d9488',
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
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  brand: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0d9488',
    marginRight: 4,
  },
  search: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#ccf0e8',
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#0f172a',
    backgroundColor: '#e8f5f1',
    fontWeight: '500',
  },
  searchWide: {
    maxWidth: 680,
  },
  profileButton: {
    height: 44,
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#ccf0e8',
    backgroundColor: '#e8f5f1',
  },
  profileEmoji: {
    fontSize: 16,
  },
  profileText: {
    fontSize: 13,
    color: '#0d9488',
    fontWeight: '700',
  },
})
