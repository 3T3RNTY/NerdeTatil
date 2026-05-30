import { useState } from 'react'
import { Link, usePathname, useRouter } from 'expo-router'
import { Platform, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View, Modal } from 'react-native'
import { env } from '@/src/config/env'
import { tokens } from '@/src/theme/tokens'

type SearchType = 'title' | 'city' | 'country'

const SEARCH_TYPES: { value: SearchType; label: string; emoji: string }[] = [
  { value: 'title', label: 'Başlık', emoji: '📝' },
  { value: 'city', label: 'Şehir', emoji: '🏙️' },
  { value: 'country', label: 'Ülke', emoji: '🌍' },
]

export function AppHeader() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const isWide = width >= 900
  const isMobile = Platform.OS !== 'web'
  const pathname = usePathname()
  const isProfilePage = pathname === '/profil'
  const searchStyle = StyleSheet.flatten([styles.search, isWide && styles.searchWide])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<SearchType>('title')
  const [showSearchTypeModal, setShowSearchTypeModal] = useState(false)

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const params: any = { }
      
      // Build params based on search type
      if (searchType === 'title') {
        params.q = searchQuery
      } else if (searchType === 'city') {
        params.city = searchQuery
      } else if (searchType === 'country') {
        params.country = searchQuery
      }

      router.push({
        pathname: '/search',
        params,
      })
      setSearchQuery('')
    }
  }

  const getSearchTypeLabel = () => {
    const found = SEARCH_TYPES.find(t => t.value === searchType)
    return found ? `${found.emoji} ${found.label}` : searchType
  }

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
        
        {/* Search Input with Type Selector */}
        <View style={searchStyle}>
          <TextInput
            style={styles.searchInput}
            placeholder={`${getSearchTypeLabel()} ara...`}
            placeholderTextColor={tokens.colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <Pressable 
            style={styles.searchTypeButton}
            onPress={() => setShowSearchTypeModal(true)}
          >
            <Text style={styles.searchTypeButtonText}>{getSearchTypeLabel()}</Text>
          </Pressable>
        </View>

        {/* Search Type Modal */}
        <Modal
          visible={showSearchTypeModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowSearchTypeModal(false)}
        >
          <Pressable 
            style={styles.modalOverlay}
            onPress={() => setShowSearchTypeModal(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Arama Türünü Seçin</Text>
              {SEARCH_TYPES.map((type) => (
                <Pressable
                  key={type.value}
                  style={[
                    styles.modalOption,
                    searchType === type.value && styles.modalOptionSelected
                  ]}
                  onPress={() => {
                    setSearchType(type.value)
                    setSearchQuery('')
                    setShowSearchTypeModal(false)
                  }}
                >
                  <Text style={[
                    styles.modalOptionText,
                    searchType === type.value && styles.modalOptionTextSelected
                  ]}>
                    {type.emoji} {type.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Modal>

        {/* Profile Button */}
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
    paddingHorizontal: tokens.spacing[2],
    paddingRight: 0,
    fontSize: tokens.typography.fontSize.base,
    color: tokens.colors.text,
    backgroundColor: tokens.colors.secondaryLighter,
    fontWeight: tokens.typography.fontWeight.medium as any,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
    fontSize: tokens.typography.fontSize.base,
    color: tokens.colors.text,
    fontWeight: tokens.typography.fontWeight.medium as any,
  },
  searchTypeButton: {
    paddingHorizontal: tokens.spacing[3],
    paddingVertical: tokens.spacing[2],
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: tokens.colors.border,
    minWidth: 80,
  },
  searchTypeButtonText: {
    color: tokens.colors.primary,
    fontWeight: '600',
    fontSize: 11,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: tokens.spacing[5],
  },
  modalContent: {
    backgroundColor: tokens.colors.background,
    borderRadius: tokens.borderRadius.xl,
    padding: tokens.spacing[5],
    minWidth: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: tokens.typography.fontSize.base,
    fontWeight: '700',
    color: tokens.colors.text,
    marginBottom: tokens.spacing[4],
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[4],
    borderRadius: tokens.borderRadius.lg,
    marginBottom: tokens.spacing[2],
    backgroundColor: tokens.colors.secondaryLighter,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modalOptionSelected: {
    backgroundColor: tokens.colors.primary,
    borderColor: tokens.colors.primary,
  },
  modalOptionText: {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: '500',
    color: tokens.colors.text,
    textAlign: 'center',
  },
  modalOptionTextSelected: {
    color: tokens.colors.background,
    fontWeight: '600',
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
