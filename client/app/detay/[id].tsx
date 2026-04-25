import { useEffect, useState } from 'react'
import { Link, useLocalSearchParams } from 'expo-router'
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import { AppHeader } from '@/src/components/AppHeader'
import { ImagePlaceholder } from '@/src/components/ImagePlaceholder'
import { PageShell } from '@/src/components/PageShell'
import { PostService, PostDetail, Comment } from '@/src/api/postService'
import { useAuth } from '@/src/hooks/useAuth'

export default function DetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>()
  const { width } = useWindowDimensions()
  const isWideWeb = Platform.OS === 'web' && width >= 980
  const { user } = useAuth()
  const [post, setPost] = useState<PostDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchPost()
    }
  }, [params.id])

  const fetchPost = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await PostService.getPostById(params.id!)
      setPost(data)
    } catch (err: any) {
      setError(err?.error || 'Paylaşım yüklenemedi')
      console.error('Error fetching post:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!commentText.trim() || !user || !post) {
      return
    }

    try {
      setSubmittingComment(true)
      await PostService.addComment(post.id, {
        userId: user.id,
        content: commentText,
      })
      setCommentText('')
      // Refresh post to show new comment
      await fetchPost()
    } catch (err: any) {
      console.error('Error adding comment:', err)
    } finally {
      setSubmittingComment(false)
    }
  }

  if (loading) {
    return (
      <View style={[styles.screen, styles.centerContent]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    )
  }

  if (error || !post) {
    return (
      <View style={styles.screen}>
        <AppHeader />
        <PageShell>
          <Link href="/" asChild>
            <Pressable style={styles.backButton}>
              <Text style={styles.backButtonText}>← Ana sayfa</Text>
            </Pressable>
          </Link>
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error || 'Paylaşım bulunamadı'}</Text>
          </View>
        </PageShell>
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      <AppHeader />
      <PageShell>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Link href="/" asChild>
            <Pressable style={styles.backButton}>
              <Text style={styles.backButtonText}>← Ana sayfa</Text>
            </Pressable>
          </Link>

          <View style={[styles.contentLayout, isWideWeb && styles.contentLayoutWide]}>
            <View style={[styles.mainColumn, isWideWeb && styles.mainColumnWide]}>
              <ImagePlaceholder
                style={isWideWeb ? styles.heroImageWide : undefined}
              />
              <Text style={styles.meta}>ID: {post.id}</Text>
              {post.location && (
                <Text style={styles.location}>
                  📍 {post.location.name}, {post.location.city}
                </Text>
              )}

              <View style={styles.block}>
                <Text style={styles.blockTitle}>{post.title || 'Paylaşım'}</Text>
                <Text style={styles.blockText}>{post.description}</Text>
                {post.user && (
                  <View style={styles.authorInfo}>
                    <Text style={styles.authorText}>
                      Paylaşan: {post.user.username}
                    </Text>
                    <Text style={styles.dateText}>
                      {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={[styles.sideColumn, isWideWeb && styles.sideColumnWide]}>
              {post.rating && (
                <View style={styles.scoreBox}>
                  <Text style={styles.score}>★ {post.rating}</Text>
                  <Text style={styles.scoreSub}>{post.likesCount} beğeni</Text>
                </View>
              )}

              <View style={styles.block}>
                <Text style={styles.blockTitle}>Yorumlar ({post.comments.length})</Text>
                {post.comments.length === 0 ? (
                  <Text style={styles.emptyText}>Henüz yorum yok</Text>
                ) : (
                  post.comments.map((comment) => (
                    <View key={comment.id} style={styles.commentRow}>
                      <Text style={styles.commentUser}>{comment.user.username}</Text>
                      <Text style={styles.commentText}>{comment.content}</Text>
                      <Text style={styles.commentDate}>
                        {new Date(comment.createdAt).toLocaleDateString('tr-TR')}
                      </Text>
                    </View>
                  ))
                )}
              </View>

              {user && (
                <View style={styles.commentComposer}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Yorumunu yaz..."
                    placeholderTextColor="#64748b"
                    value={commentText}
                    onChangeText={setCommentText}
                    editable={!submittingComment}
                    multiline
                  />
                  <Pressable
                    style={[
                      styles.sendButton,
                      (submittingComment || !commentText.trim()) &&
                        styles.sendButtonDisabled,
                    ]}
                    onPress={handleAddComment}
                    disabled={submittingComment || !commentText.trim()}
                  >
                    {submittingComment ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.sendButtonText}>+</Text>
                    )}
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
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
  backButton: {
    alignSelf: 'flex-start',
    minHeight: 38,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#0d9488',
    fontSize: 14,
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  errorText: {
    color: '#991b1b',
    fontSize: 12,
    textAlign: 'center',
  },
  meta: {
    color: '#64748b',
    fontSize: 13,
  },
  location: {
    color: '#666',
    fontSize: 13,
    fontWeight: '500',
  },
  contentLayout: {
    gap: 14,
  },
  contentLayoutWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  mainColumn: {
    gap: 14,
  },
  mainColumnWide: {
    flex: 1.1,
  },
  sideColumn: {
    gap: 14,
  },
  sideColumnWide: {
    flex: 0.9,
  },
  heroImageWide: {
    minHeight: 300,
  },
  block: {
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe4ef',
    padding: 14,
    gap: 8,
  },
  blockTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  blockText: {
    color: '#334155',
    lineHeight: 20,
  },
  authorInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#dbe4ef',
    gap: 4,
  },
  authorText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  dateText: {
    fontSize: 11,
    color: '#999',
  },
  emptyText: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },
  scoreBox: {
    borderRadius: 16,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    padding: 14,
    alignItems: 'center',
  },
  score: {
    color: '#92400e',
    fontSize: 30,
    fontWeight: '800',
  },
  scoreSub: {
    color: '#78350f',
    marginTop: 4,
    fontSize: 12,
  },
  commentRow: {
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 10,
    gap: 4,
    marginBottom: 8,
  },
  commentUser: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  commentText: {
    color: '#334155',
    fontSize: 12,
  },
  commentDate: {
    fontSize: 11,
    color: '#999',
  },
  commentComposer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-end',
  },
  commentInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#0f172a',
  },
  sendButton: {
    height: 44,
    width: 44,
    borderRadius: 12,
    backgroundColor: '#0d9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 24,
    lineHeight: 26,
    fontWeight: '600',
  },
})
