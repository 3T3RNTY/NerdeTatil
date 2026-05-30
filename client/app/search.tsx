import { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native'
import { AppHeader } from '@/src/components/AppHeader'
import { PageShell } from '@/src/components/PageShell'
import { PostService, Post, SearchSummaryResponse } from '@/src/api/postService'
import { tokens } from '@/src/theme/tokens'
import { SearchSummary } from './components/SearchSummary'
import TripCard from './components/TripCard'
import FoodPlaceCard from './components/FoodPlaceCard'
import HotelCard from './components/HotelCard'
import AttractionCard from './components/AttractionCard'

// Helper function to render the correct card component based on postType
const renderPostCard = (post: Post, isWideWeb: boolean, isMobile: boolean) => {
  if (post.postType) {
    switch (post.postType) {
      case 'TRIP':
        return <TripCard key={post.id} post={post} isWideWeb={isWideWeb} isMobile={isMobile} />
      case 'LOCATION':
        return <AttractionCard key={post.id} post={post} isWideWeb={isWideWeb} isMobile={isMobile} />
      default:
        return <AttractionCard key={post.id} post={post} isWideWeb={isWideWeb} isMobile={isMobile} />
    }
  }

  switch (post.category) {
    case 'TRIP':
      return <TripCard key={post.id} post={post} isWideWeb={isWideWeb} isMobile={isMobile} />
    case 'FOOD_PLACE':
      return <FoodPlaceCard key={post.id} post={post} isWideWeb={isWideWeb} isMobile={isMobile} />
    case 'HOTEL':
      return <HotelCard key={post.id} post={post} isWideWeb={isWideWeb} isMobile={isMobile} />
    case 'ATTRACTION':
      return <AttractionCard key={post.id} post={post} isWideWeb={isWideWeb} isMobile={isMobile} />
    default:
      return <AttractionCard key={post.id} post={post} isWideWeb={isWideWeb} isMobile={isMobile} />
  }
}

export default function SearchScreen() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const isWideWeb = Platform.OS === 'web' && width >= 920
  const isMobile = Platform.OS !== 'web'
  const params = useLocalSearchParams()

  const [searchQuery, setSearchQuery] = useState<string>((params.q as string) || '')
  const [city, setCity] = useState<string>((params.city as string) || '')
  const [country, setCountry] = useState<string>((params.country as string) || '')
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hasSearched, setHasSearched] = useState(false)
  const [summary, setSummary] = useState<SearchSummaryResponse | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(false)

  const listStyle = StyleSheet.flatten([styles.list, isWideWeb && styles.listWide])

  useEffect(() => {
    // If we have initial search params, perform search
    if (searchQuery || city || country) {
      performSearch(1)
    } else {
      setLoading(false)
    }
  }, [])

  const performSearch = async (pageNum: number = 1) => {
    try {
      setLoading(true)
      setError(null)
      setHasSearched(true)
      setSummary(null) // Reset summary when new search starts

      const result = await PostService.searchPosts(
        searchQuery,
        {
          city: city || undefined,
          country: country || undefined,
        },
        pageNum,
        10
      )

      if (pageNum === 1) {
        setPosts(result.posts)
        // Fetch AI summary on first page
        fetchSummary(searchQuery, city, country)
      } else {
        setPosts([...posts, ...result.posts])
      }
      setPage(pageNum)
      setTotalPages(result.pagination.pages)
    } catch (err: any) {
      setError(err?.error || 'Arama başarısız oldu')
      console.error('Error searching posts:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSummary = async (q: string = '', c?: string, co?: string) => {
    try {
      setLoadingSummary(true)
      const summaryResult = await PostService.searchSummary(q, {
        city: c || undefined,
        country: co || undefined,
      })
      setSummary(summaryResult)
    } catch (err: any) {
      console.error('Error fetching summary:', err)
      // Don't show error for summary, just silently fail
    } finally {
      setLoadingSummary(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    performSearch(1)
  }

  const handleLoadMore = () => {
    if (page < totalPages) {
      performSearch(page + 1)
    }
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setCity('')
    setCountry('')
    setPosts([])
    setHasSearched(false)
    setSummary(null)
  }

  const handleRefreshSummary = async () => {
    await fetchSummary(searchQuery, city, country)
  }

  return (
    <View style={styles.screen}>
      <AppHeader />
      <PageShell>
        {/* Back Button and Title */}
        <View style={styles.headerArea}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Geri</Text>
          </Pressable>
          <Text style={styles.title}>🔍 Ara</Text>
        </View>

        {/* Search Filters */}
        <View style={styles.filterContainer}>
          <TextInput
            style={styles.input}
            placeholder="Başlık veya açıklama ara..."
            placeholderTextColor={tokens.colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TextInput
            style={styles.input}
            placeholder="Şehir..."
            placeholderTextColor={tokens.colors.textTertiary}
            value={city}
            onChangeText={setCity}
          />
          <TextInput
            style={styles.input}
            placeholder="Ülke..."
            placeholderTextColor={tokens.colors.textTertiary}
            value={country}
            onChangeText={setCountry}
          />

          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.searchButton, { flex: 1 }]}
              onPress={handleSearch}
              disabled={loading}
            >
              {loading && page === 1 ? (
                <ActivityIndicator size="small" color={tokens.colors.background} />
              ) : (
                <Text style={styles.searchButtonText}>🔍 Ara</Text>
              )}
            </Pressable>

            {hasSearched && (
              <Pressable style={[styles.clearButton, { marginLeft: 10 }]} onPress={handleClearFilters}>
                <Text style={styles.clearButtonText}>Temizle</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Results */}
        {hasSearched && (
          <>
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorEmoji}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {loading && page === 1 ? (
              <View style={StyleSheet.flatten([styles.screen, styles.centerContent])}>
                <ActivityIndicator size="large" color={tokens.colors.primary} />
              </View>
            ) : posts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>😕</Text>
                <Text style={styles.emptyText}>
                  {searchQuery || city || country ? 'Sonuç bulunamadı' : 'Arama kriterleri girin'}
                </Text>
              </View>
            ) : (
              <View>
                {/* AI Summary */}
                {summary && (
                  <SearchSummary
                    summary={summary.summary}
                    loading={loadingSummary}
                    cached={summary.cached}
                    onRefresh={handleRefreshSummary}
                  />
                )}

                <Text style={styles.resultsInfo}>
                  {posts.length} sonuç bulundu
                </Text>

                <View style={listStyle}>
                  {posts.map((post) => renderPostCard(post, isWideWeb, isMobile))}
                </View>

                {/* Load More Button */}
                {page < totalPages && (
                  <Pressable
                    style={styles.loadMoreButton}
                    onPress={handleLoadMore}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color={tokens.colors.background} />
                    ) : (
                      <Text style={styles.loadMoreText}>Daha Fazla Yükle</Text>
                    )}
                  </Pressable>
                )}
              </View>
            )}
          </>
        )}

        {/* No Search Yet */}
        {!hasSearched && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>Başlamak için arama kriterleri girin</Text>
          </View>
        )}
      </PageShell>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tokens.colors.secondaryLighter,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerArea: {
    gap: 8,
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 0,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 14,
    color: tokens.colors.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: tokens.colors.primary,
  },
  filterContainer: {
    backgroundColor: tokens.colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  input: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: tokens.colors.secondaryLighter,
    color: tokens.colors.text,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  searchButton: {
    backgroundColor: tokens.colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: tokens.colors.background,
    fontWeight: '700',
    fontSize: 14,
  },
  clearButton: {
    backgroundColor: tokens.colors.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  clearButtonText: {
    color: tokens.colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  resultsInfo: {
    fontSize: 14,
    color: tokens.colors.textSecondary,
    marginBottom: 12,
    fontWeight: '500',
  },
  errorBox: {
    backgroundColor: tokens.colors.errorLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderLeftWidth: 4,
    borderLeftColor: tokens.colors.error,
  },
  errorEmoji: {
    fontSize: 18,
  },
  errorText: {
    color: tokens.colors.error,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyText: {
    textAlign: 'center',
    color: tokens.colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  loadMoreButton: {
    backgroundColor: tokens.colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  loadMoreText: {
    color: tokens.colors.background,
    fontWeight: '700',
    fontSize: 14,
  },
  list: {
    gap: 16,
  },
  listWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  errorLight: {
    backgroundColor: '#fecaca',
  },
})
