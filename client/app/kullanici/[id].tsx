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
  ScrollView,
} from 'react-native'
import { AppHeader } from '@/src/components/AppHeader'
import { PageShell } from '@/src/components/PageShell'
import { useAuth } from '@/src/hooks/useAuth'
import { UserService, UserProfile } from '@/src/api/userService'
import { tokens } from '@/src/theme/tokens'
import { FollowButton } from '../_components/FollowButton'

export default function KullaniciProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { width } = useWindowDimensions()
  const isWideWeb = Platform.OS === 'web' && width >= 980
  const { user: currentUser } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      if (currentUser?.id === id) {
        router.replace('/profil')
        return
      }
      fetchProfile()
    }
  }, [id, currentUser?.id])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await UserService.getUserProfile(id!)
      setProfile(data)
    } catch (err: any) {
      setError(err?.error || 'Profil yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleFollowChange = (following: boolean) => {
    if (!profile) return
    setProfile({
      ...profile,
      isFollowing: following,
      followersCount: following
        ? profile.followersCount + 1
        : Math.max(0, profile.followersCount - 1),
    })
  }

  if (loading) {
    return (
      <View style={StyleSheet.flatten([styles.screen, styles.centerContent])}>
        <ActivityIndicator size="large" color={tokens.colors.primary} />
      </View>
    )
  }

  if (!profile) {
    return (
      <View style={styles.screen}>
        <AppHeader />
        <PageShell>
          <Text style={styles.errorText}>{error || 'Kullanıcı bulunamadı'}</Text>
        </PageShell>
      </View>
    )
  }

  const heroStyle = StyleSheet.flatten([styles.hero, isWideWeb && styles.heroWide])

  return (
    <View style={styles.screen}>
      <AppHeader />
      <PageShell>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Geri</Text>
          </Pressable>

          <View style={heroStyle}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatar}>
                {(profile.username || '?').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.heroTextWrap}>
              <Text style={styles.displayName}>{profile.fullName || profile.username}</Text>
              <Text style={styles.heroSub}>@{profile.username}</Text>
            </View>
            <FollowButton
              userId={profile.id}
              initialFollowing={!!profile.isFollowing}
              onChange={handleFollowChange}
            />
          </View>

          {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

          <View style={StyleSheet.flatten([styles.statsGrid, isWideWeb && styles.statsGridWide])}>
            <Pressable
              style={styles.statCard}
              onPress={() => router.push(`/user-posts?userId=${profile.id}`)}
            >
              <Text style={styles.statNumber}>{profile.postsCount}</Text>
              <Text style={styles.statName}>Paylaşım</Text>
            </Pressable>
            <Pressable
              style={styles.statCard}
              onPress={() => router.push(`/user-commented-posts?userId=${profile.id}`)}
            >
              <Text style={styles.statNumber}>{profile.commentsCount}</Text>
              <Text style={styles.statName}>Yorum</Text>
            </Pressable>
            <Pressable
              style={styles.statCard}
              onPress={() => router.push(`/user-followers?userId=${profile.id}`)}
            >
              <Text style={styles.statNumber}>{profile.followersCount}</Text>
              <Text style={styles.statName}>Takipçi</Text>
            </Pressable>
            <Pressable
              style={styles.statCard}
              onPress={() => router.push(`/user-following?userId=${profile.id}`)}
            >
              <Text style={styles.statNumber}>{profile.followingCount}</Text>
              <Text style={styles.statName}>Takip</Text>
            </Pressable>
          </View>
        </ScrollView>
      </PageShell>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tokens.colors.pageBackground },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: tokens.spacing[3],
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
  hero: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: tokens.colors.borderStrong,
    backgroundColor: tokens.colors.surface,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  heroWide: { paddingHorizontal: 20 },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: tokens.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: { fontSize: 28 },
  heroTextWrap: { flex: 1, minWidth: 0 },
  displayName: {
    fontSize: 20,
    fontWeight: '800',
    color: tokens.colors.primary,
  },
  heroSub: {
    marginTop: 2,
    color: tokens.colors.textSecondary,
    fontSize: 13,
  },
  bio: {
    fontSize: 14,
    color: tokens.colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statsGridWide: { gap: 14 },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    backgroundColor: tokens.colors.surface,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.borderStrong,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: tokens.colors.primary,
  },
  statName: {
    fontSize: 11,
    color: tokens.colors.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  errorText: { color: tokens.colors.error, textAlign: 'center', padding: 20 },
})
