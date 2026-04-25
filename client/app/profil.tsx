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
  ScrollView,
} from 'react-native'
import { AppHeader } from '@/src/components/AppHeader'
import { PageShell } from '@/src/components/PageShell'
import { useAuth } from '@/src/hooks/useAuth'
import { UserService, UserProfile } from '@/src/api/userService'

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '-'}</Text>
    </View>
  )
}

export default function ProfileScreen() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const isWideWeb = Platform.OS === 'web' && width >= 980
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      if (user) {
        const data = await UserService.getUserProfile(user.id)
        setProfile(data)
      }
    } catch (err: any) {
      setError(err?.error || 'Profil yüklenemedi')
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.replace('/login')
    } catch (err) {
      console.error('Error logging out:', err)
    }
  }

  if (loading) {
    return (
      <View style={[styles.screen, styles.centerContent]}>
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    )
  }

  if (!user || !profile) {
    return (
      <View style={styles.screen}>
        <AppHeader />
        <PageShell>
          <View style={styles.errorBox}>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.errorText}>{error || 'Profil bulunamadı'}</Text>
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
          <View style={[styles.hero, isWideWeb && styles.heroWide]}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatar}>👤</Text>
            </View>
            <View style={styles.heroTextWrap}>
              <Text style={styles.displayName}>{profile.fullName || profile.username}</Text>
              <Text style={styles.heroSub}>@{profile.username}</Text>
            </View>
            <Pressable style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Çıkış</Text>
            </Pressable>
          </View>

          {/* Quick Stats */}
          <View style={[styles.statsGrid, isWideWeb && styles.statsGridWide]}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{profile.postsCount}</Text>
              <Text style={styles.statName}>Paylaşım</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{profile.commentsCount}</Text>
              <Text style={styles.statName}>Yorum</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{profile.followersCount}</Text>
              <Text style={styles.statName}>Takipçi</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{profile.followingCount}</Text>
              <Text style={styles.statName}>Takip</Text>
            </View>
          </View>

          <View style={[styles.sections, isWideWeb && styles.sectionsWide]}>
            <View style={[styles.card, isWideWeb && styles.profileCardWide]}>
              <Text style={styles.cardTitle}>👤 Profil Detayı</Text>
              <InfoRow label="Kullanıcı Adı" value={profile.username} />
              <InfoRow label="Ad Soyad" value={profile.fullName} />
              <InfoRow label="E-posta" value={profile.email} />
              <InfoRow label="Hakkımda" value={profile.bio} />
            </View>

            <View style={[styles.card, isWideWeb && styles.postCardWide]}>
              <Text style={styles.cardTitle}>✍️ Paylaşımlar</Text>
              <View style={styles.placeholder}>
                <Text style={styles.placeholderEmoji}>📝</Text>
                <Text style={styles.placeholderText}>
                  {profile.postsCount === 0
                    ? 'Henüz paylaşım yok'
                    : `${profile.postsCount} paylaşımın var`}
                </Text>
              </View>
              <Link href="/yeni-paylasim" asChild>
                <Pressable style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>+ Yeni Paylaşım</Text>
                </Pressable>
              </Link>
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
    backgroundColor: '#e8f5f1',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  hero: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ccf0e8',
    backgroundColor: '#f0fdf9',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#0d9488',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  heroWide: {
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#d1f3ed',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0d9488',
    shadowOffset: { width: -2, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    fontSize: 32,
  },
  heroTextWrap: {
    flex: 1,
  },
  displayName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0d9488',
  },
  heroSub: {
    marginTop: 2,
    color: '#0f766e',
    fontWeight: '500',
    fontSize: 13,
  },
  logoutButton: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    shadowColor: '#dc2626',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#dc2626',
    letterSpacing: 0.3,
  },
  errorBox: {
    backgroundColor: '#dcfce7',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
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
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  statsGridWide: {
    gap: 14,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#f0fdf9',
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccf0e8',
    shadowColor: '#0d9488',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0d9488',
  },
  statName: {
    fontSize: 11,
    color: '#0f766e',
    marginTop: 4,
    fontWeight: '600',
  },
  sections: {
    gap: 16,
    marginTop: 16,
  },
  sectionsWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ccf0e8',
    backgroundColor: '#f0fdf9',
    padding: 16,
    gap: 12,
    shadowColor: '#0d9488',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  profileCardWide: {
    flex: 1,
  },
  postCardWide: {
    flex: 0.8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0d9488',
  },
  infoRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#d1f3ed',
    gap: 4,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f766e',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
  },
  placeholder: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ccf0e8',
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#e8f5f1',
  },
  placeholderEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  placeholderText: {
    color: '#0f766e',
    fontSize: 13,
    fontWeight: '500',
  },
  primaryButton: {
    borderRadius: 12,
    backgroundColor: '#0d9488',
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
})
