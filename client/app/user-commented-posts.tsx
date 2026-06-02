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
} from 'react-native'
import { AppHeader } from '@/src/components/AppHeader'
import { PageShell } from '@/src/components/PageShell'
import { PostService, Post } from '@/src/api/postService'
import { useAuth } from '@/src/hooks/useAuth'
import { tokens } from '@/src/theme/tokens'
import { renderPostCard } from './_components/renderPostCard'

export default function UserCommentedPostsScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ userId?: string }>()
  const { width } = useWindowDimensions()
  const isWideWeb = Platform.OS === 'web' && width >= 920
  const isMobile = Platform.OS !== 'web'
  const { user } = useAuth()
  const targetUserId = params.userId || user?.id
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (targetUserId) fetchPosts()
  }, [targetUserId])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      if (targetUserId) {
        const result = await PostService.getPostsCommentedByUser(targetUserId, 1, 50)
        setPosts(result.posts)
      }
    } catch (err: any) {
      setError(err?.error || 'Yorum yapılan paylaşımlar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const listStyle = StyleSheet.flatten([styles.list, isWideWeb && styles.listWide])

  if (loading) {
    return (
      <View style={StyleSheet.flatten([styles.screen, styles.centerContent])}>
        <ActivityIndicator size="large" color={tokens.colors.primary} />
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      <AppHeader />
      <PageShell>
        <View style={styles.titleArea}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Geri</Text>
          </Pressable>
          <Text style={styles.title}>💬 Yorum Yaptığım Paylaşımlar</Text>
          <Text style={styles.subtitle}>
            {posts.length === 0
              ? 'Henüz yorum yapmadınız'
              : `${posts.length} paylaşımda yorumunuz var`}
          </Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={listStyle}>
          {posts.length === 0 ? (
            <Text style={styles.emptyText}>Henüz yorum yapılmış paylaşım yok</Text>
          ) : (
            posts.map((post) => renderPostCard(post, isWideWeb, isMobile))
          )}
        </View>
      </PageShell>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tokens.colors.pageBackground },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  titleArea: { gap: 8, marginBottom: 20 },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: tokens.colors.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: tokens.colors.primary,
  },
  subtitle: {
    fontSize: 15,
    color: tokens.colors.textSecondary,
    fontWeight: '500',
  },
  errorBox: {
    backgroundColor: tokens.colors.errorLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  errorText: { color: tokens.colors.error, fontSize: 13, fontWeight: '600' },
  list: { gap: 16 },
  listWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyText: {
    textAlign: 'center',
    color: tokens.colors.textSecondary,
    paddingVertical: 40,
  },
})
