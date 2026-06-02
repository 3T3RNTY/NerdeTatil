import { useEffect, useState } from 'react'
import { Link, useRouter } from 'expo-router'
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ActivityIndicator,
  FlatList,
  Image,
} from 'react-native'
import { AppHeader } from '@/src/components/AppHeader'
import { ImagePlaceholder } from '@/src/components/ImagePlaceholder'
import { PageShell } from '@/src/components/PageShell'
import { PostService, Post } from '@/src/api/postService'
import { tokens } from '@/src/theme/tokens'
import TripCard from './_components/TripCard'
import FoodPlaceCard from './_components/FoodPlaceCard'
import HotelCard from './_components/HotelCard'
import AttractionCard from './_components/AttractionCard'
import { useAuth } from '@/src/hooks/useAuth'

// Helper function to render the correct card component based on category or postType
const renderPostCard = (post: Post, isWideWeb: boolean, isMobile: boolean) => {
  // Handle new post format (postType)
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

  // Handle legacy post format (category)
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

export default function HomeScreen() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const isWideWeb = Platform.OS === 'web' && width >= 920
  const isMobile = Platform.OS !== 'web'
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  
  const listStyle = StyleSheet.flatten([styles.list, isWideWeb && styles.listWide])

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await PostService.getPosts(page, 10)
      setPosts(result.posts)
    } catch (err: any) {
      setError(err?.error || 'Paylaşımlar yüklenemedi')
      console.error('Error fetching posts:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    const loadingStyle = StyleSheet.flatten([styles.screen, styles.centerContent])
    return (
      <View style={loadingStyle}>
        <ActivityIndicator size="large" color={tokens.colors.primary} />
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      <AppHeader />
      <PageShell>
        <View style={styles.titleArea}>
          <Text style={styles.title}>✨ Keşfet</Text>
          <Text style={styles.subtitle}>
            Sıradaki tatilini seçmek için kategorize edilmiş paylaşımları incele
          </Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={listStyle}>
          {posts.length === 0 ? (
            <Text style={styles.emptyText}>Henüz paylaşım yok</Text>
          ) : (
            posts.map((post) => renderPostCard(post, isWideWeb, isMobile))
          )}
        </View>
      </PageShell>
      {user && (
        <Pressable
          style={styles.aiFab}
          onPress={() => router.push('/suggestions')}
        >
          <Text style={styles.aiFabText}>AI</Text>
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tokens.colors.pageBackground,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleArea: {
    gap: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: tokens.colors.primary,
  },
  subtitle: {
    fontSize: 15,
    color: tokens.colors.contrast,
    fontWeight: '500',
  },
  errorBox: {
    backgroundColor: tokens.colors.successLight,
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
  emptyText: {
    textAlign: 'center',
    color: tokens.colors.textSecondary,
    fontSize: 14,
    paddingVertical: 40,
    fontWeight: '500',
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
  aiFab: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'web' ? 24 : 90,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: tokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: tokens.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 20,
  },
  aiFabText: {
    color: tokens.colors.background,
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.4,
  },
})
