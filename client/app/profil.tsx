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
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    )
  }

  if (!user || !profile) {
    return (
      <View style={styles.screen}>
        <AppHeader />
        <PageShell>
          <View style={styles.errorBox}>
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
            <Text style={styles.avatar}>👤</Text>
            <View style={styles.heroTextWrap}>
              <Text style={styles.displayName}>{profile.fullName || profile.username}</Text>
              <Text style={styles.heroSub}>Tatil önerilerini paylaş</Text>
            </View>
            <Pressable style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Çıkış</Text>
            </Pressable>
          </View>

          <View style={[styles.sections, isWideWeb && styles.sectionsWide]}>
            <View style={[styles.card, isWideWeb && styles.profileCardWide]}>
              <Text style={styles.cardTitle}>Profil Detayı</Text>
              <InfoRow label="Kullanıcı Adı" value={profile.username} />
              <InfoRow label="Ad Soyad" value={profile.fullName} />
              <InfoRow label="E-posta" value={profile.email} />
              <InfoRow label="Hakkımda" value={profile.bio} />
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{profile.postsCount}</Text>
                  <Text style={styles.statLabel}>Paylaşım</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{profile.commentsCount}</Text>
                  <Text style={styles.statLabel}>Yorum</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{profile.followersCount}</Text>
                  <Text style={styles.statLabel}>Takipçi</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{profile.followingCount}</Text>
                  <Text style={styles.statLabel}>Takip Eden</Text>
                </View>
              </View>
            </View>

            <View style={[styles.card, isWideWeb && styles.postCardWide]}>
              <Text style={styles.cardTitle}>Paylaşımlar</Text>
              <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>
                  {profile.postsCount === 0
                    ? 'Henüz paylaşım yok'
                    : `${profile.postsCount} paylaşımın var`}
                </Text>
              </View>
              <Link href="/yeni-paylasim" asChild>
                <Pressable style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>Yeni Paylaşım</Text>
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
    backgroundColor: '#f1f5f9',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  hero: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#dbe4ef',
    backgroundColor: '#ffffff',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroWide: {
    paddingHorizontal: 18,
  },
  avatar: {
    fontSize: 28,
  },
  heroTextWrap: {
    flex: 1,
  },
  displayName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  heroSub: {
    marginTop: 2,
    color: '#64748b',
  },
  logoutButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ef4444',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  logoutButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
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
  sections: {
    gap: 14,
    marginTop: 14,
  },
  sectionsWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#dbe4ef',
    backgroundColor: '#ffffff',
    padding: 14,
    gap: 12,
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
    color: '#0f172a',
  },
  infoRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 14,
    color: '#0f172a',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3b82f6',
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  placeholder: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  placeholderText: {
    color: '#999',
    fontSize: 13,
    fontStyle: 'italic',
  },
  primaryButton: {
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
})
