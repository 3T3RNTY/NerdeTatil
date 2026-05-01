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
} from 'react-native'
import { AppHeader } from '@/src/components/AppHeader'
import { PageShell } from '@/src/components/PageShell'
import { PostService, Post } from '@/src/api/postService'
import { useAuth } from '@/src/hooks/useAuth'
import TripCard from './components/TripCard'
import FoodPlaceCard from './components/FoodPlaceCard'
import HotelCard from './components/HotelCard'
import AttractionCard from './components/AttractionCard'

// Helper function to render the correct card component based on category
const renderPostCard = (post: Post, isWideWeb: boolean, isMobile: boolean, onEdit: (id: string) => void, onDelete: (id: string) => void) => {
  const cardComponent = (() => {
    switch (post.category) {
      case 'TRIP':
        return <TripCard post={post} isWideWeb={isWideWeb} isMobile={isMobile} />
      case 'FOOD_PLACE':
        return <FoodPlaceCard post={post} isWideWeb={isWideWeb} isMobile={isMobile} />
      case 'HOTEL':
        return <HotelCard post={post} isWideWeb={isWideWeb} isMobile={isMobile} />
      case 'ATTRACTION':
        return <AttractionCard post={post} isWideWeb={isWideWeb} isMobile={isMobile} />
      default:
        return <AttractionCard post={post} isWideWeb={isWideWeb} isMobile={isMobile} />
    }
  })()

  return (
    <View key={post.id}>
      {cardComponent}
      <View style={styles.editDeleteContainer}>
        <Pressable
          style={styles.editButton}
          onPress={() => onEdit(post.id)}
        >
          <Text style={styles.editButtonText}>✏️ Düzenle</Text>
        </Pressable>
        <Pressable
          style={styles.deleteButton}
          onPress={() => onDelete(post.id)}
        >
          <Text style={styles.deleteButtonText}>🗑️ Sil</Text>
        </Pressable>
      </View>
    </View>
  )
}

export default function UserPostsScreen() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const isWideWeb = Platform.OS === 'web' && width >= 920
  const isMobile = Platform.OS !== 'web'
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUserPosts()
    }
  }, [user])

  const fetchUserPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      if (user) {
        const result = await PostService.getPostsByUserId(user.id, 1, 50)
        setPosts(result.posts)
      }
    } catch (err: any) {
      setError(err?.error || 'Paylaşımlar yüklenemedi')
      console.error('Error fetching posts:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    try {
      await PostService.deletePost(postId)
      setPosts(posts.filter((p) => p.id !== postId))
      setShowDeleteConfirm(false)
      setDeletingPostId(null)
    } catch (err: any) {
      console.error('Error deleting post:', err)
    }
  }

  const handleEditPost = (postId: string) => {
    router.push(`/yeni-paylasim?edit=${postId}`)
  }

  const confirmDelete = (postId: string) => {
    setDeletingPostId(postId)
    setShowDeleteConfirm(true)
  }

  const listStyle = StyleSheet.flatten([styles.list, isWideWeb && styles.listWide])

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
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Geri</Text>
          </Pressable>
          <Text style={styles.title}>📝 Paylaşımlarım</Text>
          <Text style={styles.subtitle}>
            {posts.length === 0 ? 'Henüz paylaşım yapmadınız' : `${posts.length} paylaşımınız var`}
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
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyText}>Henüz paylaşım yok</Text>
              <Link href="/yeni-paylasim" asChild>
                <Pressable style={styles.createButton}>
                  <Text style={styles.createButtonText}>+ Yeni Paylaşım Oluştur</Text>
                </Pressable>
              </Link>
            </View>
          ) : (
            posts.map((post) => renderPostCard(post, isWideWeb, isMobile, handleEditPost, confirmDelete))
          )}
        </View>
      </PageShell>

      {showDeleteConfirm && (
        <View style={styles.confirmationOverlay}>
          <View style={styles.confirmationModal}>
            <Text style={styles.confirmationTitle}>Paylaşımı sil?</Text>
            <Text style={styles.confirmationText}>
              Bu işlem geri alınamaz. Paylaşımı silmek istediğinizden emin misiniz?
            </Text>
            <View style={styles.confirmationButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => {
                  setShowDeleteConfirm(false)
                  setDeletingPostId(null)
                }}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </Pressable>
              <Pressable
                style={styles.confirmDeleteButton}
                onPress={() => deletingPostId && handleDeletePost(deletingPostId)}
              >
                <Text style={styles.confirmDeleteButtonText}>Sil</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
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
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#f0fdf9',
    borderWidth: 1,
    borderColor: '#ccf0e8',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0d9488',
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
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    marginBottom: 16,
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
  list: {
    gap: 16,
  },
  listWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#0f766e',
    fontWeight: '600',
  },
  createButton: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: '#0d9488',
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  editDeleteContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f0fdf9',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    marginBottom: 16,
  },
  editButton: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#dbeafe',
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369a1',
  },
  deleteButton: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#dc2626',
  },
  confirmationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  confirmationModal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmationTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#dc2626',
    marginBottom: 12,
  },
  confirmationText: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
    marginBottom: 20,
    lineHeight: 20,
  },
  confirmationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b7280',
  },
  confirmDeleteButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#dc2626',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDeleteButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
})
