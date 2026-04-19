import { Link } from 'expo-router'
import { Platform, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native'
import { env } from '@/src/config/env'

export function AppHeader() {
  const { width } = useWindowDimensions()
  const isWide = width >= 900

  return (
    <View style={styles.header}>
      <View style={styles.inner}>
        {isWide ? <Text style={styles.brand}>{env.appName}</Text> : null}
        <TextInput
          style={[styles.search, isWide && styles.searchWide]}
          placeholder="Mekan, sehir veya tatil ara..."
          placeholderTextColor="#64748b"
        />
        <Link href="/profil" asChild>
          <Pressable style={styles.profileButton}>
            <Text style={styles.profileEmoji}>👤</Text>
            {isWide ? <Text style={styles.profileText}>Profil</Text> : null}
          </Pressable>
        </Link>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'web' ? 12 : 18,
  },
  inner: {
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  brand: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    marginRight: 4,
  },
  search: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
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
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
  },
  profileEmoji: {
    fontSize: 16,
  },
  profileText: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '700',
  },
})
