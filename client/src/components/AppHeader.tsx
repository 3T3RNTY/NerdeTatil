import { useState } from 'react'
import { Link, usePathname, useRouter } from 'expo-router'
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  Modal,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { env } from '@/src/config/env'
import { tokens } from '@/src/theme/tokens'

type SearchType = 'title' | 'city' | 'country'

const SEARCH_TYPES: { value: SearchType; label: string; emoji: string }[] = [
  { value: 'title', label: 'Başlık', emoji: '📝' },
  { value: 'city', label: 'Şehir', emoji: '🏙️' },
  { value: 'country', label: 'Ülke', emoji: '🌍' },
]

const CONTENT_MAX_WIDTH = 1200

export function AppHeader() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const isWeb = Platform.OS === 'web'
  const isMobile = !isWeb
  const isWideWeb = isWeb && width >= 900
  const isDesktopWeb = isWeb && width >= tokens.breakpoints.desktop
  const pathname = usePathname()
  const isProfilePage = pathname === '/profil'
  const isHomePage = pathname === '/' || pathname === ''

  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<SearchType>('title')
  const [showSearchTypeModal, setShowSearchTypeModal] = useState(false)

  const innerStyle = StyleSheet.flatten([
    styles.inner,
    isDesktopWeb && styles.innerDesktop,
  ])
  const searchBarStyle = StyleSheet.flatten([
    styles.searchBar,
    isWideWeb && styles.searchBarWide,
  ])
  const navLinkStyle = StyleSheet.flatten([
    styles.navLink,
    isHomePage && styles.navLinkActive,
  ])
  const profileButtonStyle = StyleSheet.flatten([
    styles.profileButton,
    isProfilePage && styles.profileButtonActive,
  ])
  const profileTextStyle = StyleSheet.flatten([
    styles.profileText,
    isProfilePage && styles.profileButtonActiveText,
  ])
  const searchSubmitStyle = StyleSheet.flatten([
    styles.searchSubmit,
    !searchQuery.trim() && styles.searchSubmitDisabled,
  ])

  const handleSearch = () => {
    if (!searchQuery.trim()) return

    const params: Record<string, string> = {}
    if (searchType === 'title') {
      params.q = searchQuery
    } else if (searchType === 'city') {
      params.city = searchQuery
    } else {
      params.country = searchQuery
    }

    router.push({ pathname: '/search', params })
    setSearchQuery('')
  }

  const getSearchPlaceholder = () => {
    if (searchType === 'city') return 'Şehir ara...'
    if (searchType === 'country') return 'Ülke ara...'
    return 'Başlık ara...'
  }

  return (
    <View style={styles.header}>
      <View style={innerStyle}>
        {/* Brand */}
        <View style={styles.brandColumn}>
          <Link href="/" asChild>
            <Pressable style={styles.brandPressable}>
              <View style={styles.brandMark}>
                <Text style={styles.brandMarkEmoji}>🌍</Text>
              </View>
              <View style={isWideWeb ? styles.brandTextWrap : undefined}>
                <Text style={styles.brand} numberOfLines={1}>
                  {env.appName}
                </Text>
                {isDesktopWeb ? (
                  <Text style={styles.brandTagline}>Keşfet & paylaş</Text>
                ) : null}
              </View>
            </Pressable>
          </Link>
        </View>

        {/* Search */}
        <View style={styles.searchZone}>
          {isWideWeb ? (
            <View style={styles.searchTypePills}>
              {SEARCH_TYPES.map((type) => {
                const selected = searchType === type.value
                return (
                  <Pressable
                    key={type.value}
                    style={[styles.searchPill, selected && styles.searchPillSelected]}
                    onPress={() => {
                      setSearchType(type.value)
                      setSearchQuery('')
                    }}
                  >
                    <Text style={[styles.searchPillText, selected && styles.searchPillTextSelected]}>
                      {type.emoji} {type.label}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          ) : null}

          <View style={searchBarStyle}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder={getSearchPlaceholder()}
              placeholderTextColor={tokens.colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {!isWideWeb ? (
              <Pressable style={styles.searchTypeButton} onPress={() => setShowSearchTypeModal(true)}>
                <Text style={styles.searchTypeButtonText} numberOfLines={1}>
                  {SEARCH_TYPES.find((t) => t.value === searchType)?.emoji}
                </Text>
              </Pressable>
            ) : (
              <Pressable
                style={searchSubmitStyle as StyleProp<ViewStyle>}
                onPress={handleSearch}
                disabled={!searchQuery.trim()}
              >
                <Text style={styles.searchSubmitText}>Ara</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Actions (web) */}
        {!isMobile ? (
          <View style={styles.actionsColumn}>
            {isWideWeb ? (
              <Link href="/" asChild>
                <Pressable style={navLinkStyle as StyleProp<ViewStyle>}>
                  <Text
                    style={StyleSheet.flatten([
                      styles.navLinkText,
                      isHomePage && styles.navLinkTextActive,
                    ])}
                  >
                    Keşfet
                  </Text>
                </Pressable>
              </Link>
            ) : null}
            <Link href={isProfilePage ? '/' : '/profil'} asChild>
              <Pressable style={profileButtonStyle as StyleProp<ViewStyle>}>
                <Text style={styles.profileEmoji}>{isProfilePage ? '🏠' : '👤'}</Text>
                {isWideWeb ? (
                  <Text style={profileTextStyle}>{isProfilePage ? 'Ana Sayfa' : 'Profil'}</Text>
                ) : null}
              </Pressable>
            </Link>
          </View>
        ) : null}
      </View>

      <Modal
        visible={showSearchTypeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSearchTypeModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowSearchTypeModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Arama Türünü Seçin</Text>
            {SEARCH_TYPES.map((type) => (
              <Pressable
                key={type.value}
                style={[styles.modalOption, searchType === type.value && styles.modalOptionSelected]}
                onPress={() => {
                  setSearchType(type.value)
                  setSearchQuery('')
                  setShowSearchTypeModal(false)
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    searchType === type.value && styles.modalOptionTextSelected,
                  ]}
                >
                  {type.emoji} {type.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    borderBottomWidth: 2,
    borderBottomColor: tokens.colors.navBarDark,
    backgroundColor: tokens.colors.navBar,
    paddingTop: Platform.OS === 'web' ? tokens.spacing[3] : tokens.spacing[5],
    shadowColor: tokens.colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: tokens.spacing[4],
    paddingHorizontal: tokens.spacing[4],
    paddingBottom: tokens.spacing[3],
  },
  innerDesktop: {
    paddingHorizontal: tokens.spacing[6],
    gap: tokens.spacing[6],
  },
  brandColumn: {
    flexShrink: 0,
    minWidth: 120,
    maxWidth: 200,
  },
  brandPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
  },
  brandMark: {
    width: 40,
    height: 40,
    borderRadius: tokens.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkEmoji: {
    fontSize: 20,
  },
  brandTextWrap: {
    flexShrink: 1,
    gap: 2,
  },
  brand: {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.bold as any,
    color: tokens.colors.navBarForeground,
  },
  brandTagline: {
    fontSize: tokens.typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.82)',
    fontWeight: '500',
  },
  searchZone: {
    flex: 1,
    minWidth: 0,
    gap: tokens.spacing[2],
    alignItems: 'stretch',
  },
  searchTypePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing[2],
    justifyContent: 'center',
  },
  searchPill: {
    paddingHorizontal: tokens.spacing[3],
    paddingVertical: 6,
    borderRadius: tokens.borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  searchPillSelected: {
    backgroundColor: tokens.colors.navBarForeground,
    borderColor: tokens.colors.navBarForeground,
  },
  searchPillText: {
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  searchPillTextSelected: {
    color: tokens.colors.primaryDark,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 46,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: tokens.borderRadius.lg,
    backgroundColor: tokens.colors.navBarMuted,
    overflow: 'hidden',
  },
  searchBarWide: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  searchIcon: {
    paddingLeft: tokens.spacing[3],
    fontSize: 16,
    opacity: 0.55,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: tokens.spacing[2],
    paddingVertical: tokens.spacing[3],
    fontSize: tokens.typography.fontSize.base,
    color: tokens.colors.text,
    fontWeight: tokens.typography.fontWeight.medium as any,
  },
  searchTypeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.35)',
  },
  searchTypeButtonText: {
    fontSize: 18,
  },
  searchSubmit: {
    marginRight: tokens.spacing[1],
    marginVertical: tokens.spacing[1],
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[2],
    borderRadius: tokens.borderRadius.base,
    backgroundColor: tokens.colors.primaryDark,
    justifyContent: 'center',
  },
  searchSubmitDisabled: {
    opacity: 0.45,
  },
  searchSubmitText: {
    color: tokens.colors.navBarForeground,
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: '700',
  },
  actionsColumn: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
    paddingBottom: 2,
  },
  navLink: {
    height: 44,
    paddingHorizontal: tokens.spacing[3],
    borderRadius: tokens.borderRadius.lg,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  navLinkActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  navLinkText: {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  navLinkTextActive: {
    color: tokens.colors.navBarForeground,
    fontWeight: '700',
  },
  profileButton: {
    height: 44,
    borderRadius: tokens.borderRadius.lg,
    paddingHorizontal: tokens.spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  profileButtonActive: {
    backgroundColor: tokens.colors.navBarForeground,
    borderColor: tokens.colors.navBarForeground,
  },
  profileEmoji: {
    fontSize: tokens.typography.fontSize.base,
  },
  profileText: {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.navBarForeground,
    fontWeight: tokens.typography.fontWeight.bold as any,
  },
  profileButtonActiveText: {
    color: tokens.colors.primaryDark,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: tokens.colors.overlayScrim,
    justifyContent: 'center',
    alignItems: 'center',
    padding: tokens.spacing[5],
  },
  modalContent: {
    backgroundColor: tokens.colors.background,
    borderRadius: tokens.borderRadius.xl,
    padding: tokens.spacing[5],
    minWidth: 250,
    shadowColor: tokens.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
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
    backgroundColor: tokens.colors.surfaceMuted,
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
    color: tokens.colors.navBarForeground,
    fontWeight: '600',
  },
})
