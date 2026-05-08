import { useEffect, useState } from 'react'
import { Link } from 'expo-router'
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
import TripCard from './components/TripCard'
import FoodPlaceCard from './components/FoodPlaceCard'
import HotelCard from './components/HotelCard'
import AttractionCard from './components/AttractionCard'

// Helper function to render the correct card component based on category
const renderPostCard = (post: Post, isWideWeb: boolean, isMobile: boolean) => {
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
  const { width } = useWindowDimensions()
  const isWideWeb = Platform.OS === 'web' && width >= 920
  const isMobile = Platform.OS !== 'web'
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
        <ActivityIndicator size="large" color="#0d9488" />
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
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#e8f5f1',
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
    color: '#0d9488',
  },
  subtitle: {
    fontSize: 15,
    color: '#0f766e',
    fontWeight: '500',
  },
  errorBox: {
    backgroundColor: '#dcfce7',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  errorEmoji: {
    fontSize: 18,
  },
  errorText: {
    color: '#7c2d12',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
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
})
