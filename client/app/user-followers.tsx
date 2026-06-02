import { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import { AppHeader } from '@/src/components/AppHeader'
import { PageShell } from '@/src/components/PageShell'
import { UserService, UserSummary } from '@/src/api/userService'
import { useAuth } from '@/src/hooks/useAuth'
import { tokens } from '@/src/theme/tokens'
import { UserListItem } from './_components/UserListItem'

export default function UserFollowersScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ userId?: string }>()
  const { user } = useAuth()
  const targetUserId = params.userId || user?.id
  const [users, setUsers] = useState<UserSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (targetUserId) fetchFollowers()
  }, [targetUserId])

  const fetchFollowers = async () => {
    try {
      setLoading(true)
      setError(null)
      if (targetUserId) {
        const result = await UserService.getFollowers(targetUserId, 1, 100)
        setUsers(result.users)
      }
    } catch (err: any) {
      setError(err?.error || 'Takipçiler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleFollowChange = (userId: string, following: boolean) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isFollowing: following } : u))
    )
  }

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
          <Text style={styles.title}>👥 Takipçiler</Text>
          <Text style={styles.subtitle}>
            {users.length === 0 ? 'Henüz takipçiniz yok' : `${users.length} takipçi`}
          </Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <ScrollView showsVerticalScrollIndicator={false}>
          {users.length === 0 ? (
            <Text style={styles.emptyText}>Takipçi bulunamadı</Text>
          ) : (
            users.map((u) => (
              <UserListItem key={u.id} user={u} onFollowChange={handleFollowChange} />
            ))
          )}
        </ScrollView>
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
  title: { fontSize: 28, fontWeight: '800', color: tokens.colors.primary },
  subtitle: { fontSize: 15, color: tokens.colors.textSecondary },
  errorBox: {
    backgroundColor: tokens.colors.errorLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  errorText: { color: tokens.colors.error, fontSize: 13 },
  emptyText: {
    textAlign: 'center',
    color: tokens.colors.textSecondary,
    paddingVertical: 40,
  },
})
