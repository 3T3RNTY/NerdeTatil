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
} from 'react-native'
import { AppHeader } from '@/src/components/AppHeader'
import { ImagePlaceholder } from '@/src/components/ImagePlaceholder'
import { PageShell } from '@/src/components/PageShell'
import { PostService, Post } from '@/src/api/postService'

export default function HomeScreen() {
  const { width } = useWindowDimensions()
  const isWideWeb = Platform.OS === 'web' && width >= 920
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

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
    return (
      <View style={[styles.screen, styles.centerContent]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      <AppHeader />
      <PageShell>
        <View style={styles.titleArea}>
          <Text style={styles.title}>Kesfet</Text>
          <Text style={styles.subtitle}>
            Siradaki tatilini secmek icin paylasimlari incele.
          </Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={[styles.list, isWideWeb && styles.listWide]}>
          {posts.length === 0 ? (
            <Text style={styles.emptyText}>Henüz paylaşım yok</Text>
          ) : (
            posts.map((post) => (
              <View key={post.id} style={[styles.card, isWideWeb && styles.cardWide]}>
                <ImagePlaceholder
                  style={isWideWeb ? styles.cardImageWide : undefined}
                />
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{post.title || post.description.substring(0, 30)}</Text>
                  <Text style={styles.cardDescription} numberOfLines={3}>
                    {post.description}
                  </Text>
                  {post.location && (
                    <Text style={styles.location}>
                      📍 {post.location.name}, {post.location.city}
                    </Text>
                  )}
                  {post.rating && <Text style={styles.score}>★ {post.rating}</Text>}
                  <View style={styles.stats}>
                    <Text style={styles.statText}>❤️ {post.likesCount}</Text>
                    <Text style={styles.statText}>💬 {post.commentsCount}</Text>
                  </View>
                  <Link href={`/detay/${post.id}`} asChild>
                    <Pressable style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>Incele</Text>
                    </Pressable>
                  </Link>
                </View>
              </View>
            ))
          )}
        </View>
      </PageShell>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleArea: {
    gap: 4,
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 15,
    color: '#475569',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#991b1b',
    fontSize: 12,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    paddingVertical: 20,
  },
  list: {
    gap: 14,
  },
  listWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe4ef',
    overflow: 'hidden',
  },
  cardWide: {
    width: '48%',
  },
  cardImageWide: {
    minHeight: 200,
  },
  cardBody: {
    padding: 14,
    gap: 8,
  },
  cardTitle: {
    fontSize: 20,
    color: '#0f172a',
    fontWeight: '700',
  },
  cardDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  location: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  score: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '700',
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  actionButton: {
    marginTop: 4,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: '#0d9488',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '700',
  },
})
