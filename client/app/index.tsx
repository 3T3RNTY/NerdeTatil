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
            Sıradaki tatilini seçmek için paylaşımları incele
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
            posts.map((post) => {
              const cardStyle = StyleSheet.flatten([styles.card, isWideWeb && styles.cardWide])
              return (
              <View key={post.id} style={cardStyle}>
                <View style={[styles.cardImage, isWideWeb && styles.cardImageWide, isMobile && styles.cardImageMobile]}>
                  {post.imageUrls && post.imageUrls.length > 0 ? (
                    <>
                      <Image
                        source={{ uri: post.imageUrls[0] }}
                        style={styles.image}
                        resizeMode="cover"
                      />
                      {post.imageUrls.length > 1 && (
                        <View style={styles.imageCountBadge}>
                          <Text style={styles.imageCountText}>+{post.imageUrls.length - 1}</Text>
                        </View>
                      )}
                    </>
                  ) : (
                    <ImagePlaceholder compact />
                  )}
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {post.title || post.description.substring(0, 30)}
                  </Text>
                  <Text style={styles.cardDescription} numberOfLines={3}>
                    {post.description}
                  </Text>
                  
                  {post.location && (
                    <View style={styles.locationBadge}>
                      <Text style={styles.locationEmoji}>📍</Text>
                      <Text style={styles.locationText}>
                        {post.location.name}, {post.location.city}
                      </Text>
                    </View>
                  )}

                  {post.rating && (
                    <View style={styles.ratingBadge}>
                      <Text style={styles.ratingEmoji}>★</Text>
                      <Text style={styles.ratingText}>{post.rating}</Text>
                    </View>
                  )}

                  <View style={styles.stats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statEmoji}>❤️</Text>
                      <Text style={styles.statText}>{post.likesCount}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statEmoji}>💬</Text>
                      <Text style={styles.statText}>{post.commentsCount}</Text>
                    </View>
                  </View>

                  <Link href={`/detay/${post.id}`} asChild>
                    <Pressable style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>İncele →</Text>
                    </Pressable>
                  </Link>
                </View>
              </View>
            )
            })
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
  },
  card: {
    borderRadius: 18,
    backgroundColor: '#f0fdf9',
    borderWidth: 1,
    borderColor: '#ccf0e8',
    overflow: 'hidden',
    shadowColor: '#0d9488',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  cardWide: {
    width: '48%',
  },
  cardImage: {
    minHeight: 180,
    maxHeight: 250,
    backgroundColor: '#f0f0f0',
    position: 'relative',
    overflow: 'hidden',
  },
  cardImageMobile: {
    minHeight: 120,
    maxHeight: 150,
  },
  cardImageWide: {
    minHeight: 200,
    maxHeight: 300,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageCountBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  imageCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    padding: 16,
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    color: '#0d9488',
    fontWeight: '700',
  },
  cardDescription: {
    fontSize: 13,
    color: '#0f766e',
    lineHeight: 20,
    fontWeight: '400',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#e0f2f1',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  locationEmoji: {
    fontSize: 14,
  },
  locationText: {
    fontSize: 12,
    color: '#0d7a6f',
    fontWeight: '600',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef3c7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  ratingEmoji: {
    fontSize: 14,
  },
  ratingText: {
    fontSize: 12,
    color: '#a16207',
    fontWeight: '700',
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#e8f5f1',
    borderRadius: 6,
  },
  statEmoji: {
    fontSize: 14,
  },
  statText: {
    fontSize: 12,
    color: '#0f766e',
    fontWeight: '600',
  },
  actionButton: {
    marginTop: 8,
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: '#0d9488',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
})
