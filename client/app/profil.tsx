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
  Modal,
  TextInput,
} from 'react-native'
import { AppHeader } from '@/src/components/AppHeader'
import { PageShell } from '@/src/components/PageShell'
import { useAuth } from '@/src/hooks/useAuth'
import { UserService, UserProfile } from '@/src/api/userService'
import { tokens } from '@/src/theme/tokens'

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
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editForm, setEditForm] = useState({
    fullName: '',
    bio: '',
  })
  const [editError, setEditError] = useState<string | null>(null)

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

  const openEditModal = () => {
    if (profile) {
      setEditForm({
        fullName: profile.fullName || '',
        bio: profile.bio || '',
      })
      setEditError(null)
      setIsEditModalVisible(true)
    }
  }

  const closeEditModal = () => {
    setIsEditModalVisible(false)
    setEditForm({ fullName: '', bio: '' })
    setEditError(null)
  }

  const handleSaveProfile = async () => {
    try {
      setEditError(null)
      setIsSubmitting(true)

      if (!editForm.fullName.trim()) {
        setEditError('Ad Soyad alanı boş bırakılamaz')
        setIsSubmitting(false)
        return
      }

      if (!user) {
        setEditError('Kullanıcı bilgisi yüklenemedi')
        setIsSubmitting(false)
        return
      }

      const updatedProfile = await UserService.updateUser(user.id, {
        fullName: editForm.fullName.trim(),
        bio: editForm.bio.trim(),
      })

      setProfile({
        ...profile!,
        fullName: updatedProfile.fullName,
        bio: updatedProfile.bio,
      })

      closeEditModal()
    } catch (err: any) {
      setEditError(err?.error || 'Profil güncellenirken hata oluştu')
      console.error('Error updating profile:', err)
    } finally {
      setIsSubmitting(false)
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

  const handleViewPosts = () => {
    router.push('/user-posts')
  }

  const heroStyle = StyleSheet.flatten([styles.hero, isWideWeb && styles.heroWide])
  const sectionsStyle = StyleSheet.flatten([styles.sections, isWideWeb && styles.sectionsWide])

  if (loading) {
    const loadingStyle = StyleSheet.flatten([styles.screen, styles.centerContent])
    return (
      <View style={loadingStyle}>
        <ActivityIndicator size="large" color={tokens.colors.primary} />
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
          <View style={heroStyle}>
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
          <View style={StyleSheet.flatten([styles.statsGrid, isWideWeb && styles.statsGridWide])}>
            <Pressable 
              style={styles.statCard}
              onPress={handleViewPosts}
            >
              <Text style={styles.statNumber}>{profile.postsCount}</Text>
              <Text style={styles.statName}>Paylaşım</Text>
            </Pressable>
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

          <View style={sectionsStyle}>
            <View style={StyleSheet.flatten([styles.card, isWideWeb && styles.profileCardWide])}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>👤 Profil Detayı</Text>
                <Pressable style={styles.editButton} onPress={openEditModal}>
                  <Text style={styles.editButtonText}>✏️ Düzenle</Text>
                </Pressable>
              </View>
              <InfoRow label="Kullanıcı Adı" value={profile.username} />
              <InfoRow label="Ad Soyad" value={profile.fullName} />
              <InfoRow label="E-posta" value={profile.email} />
              <InfoRow label="Hakkımda" value={profile.bio} />
            </View>

            <View style={StyleSheet.flatten([styles.card, isWideWeb && styles.postCardWide])}>
              <Text style={styles.cardTitle}>📝 Yeni Paylaşım</Text>
              <View style={styles.placeholder}>
                <Text style={styles.placeholderEmoji}>➕</Text>
                <Text style={styles.placeholderText}>
                  Yeni bir paylaşım oluştur
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

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profili Düzenle</Text>
              <Pressable onPress={closeEditModal}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </Pressable>
            </View>

            {editError && (
              <View style={styles.editErrorBox}>
                <Text style={styles.editErrorText}>{editError}</Text>
              </View>
            )}

            <View style={styles.modalFormGroup}>
              <Text style={styles.modalLabel}>Ad Soyad *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Adınız ve Soyadınız"
                value={editForm.fullName}
                onChangeText={(text) =>
                  setEditForm({ ...editForm, fullName: text })
                }
                editable={!isSubmitting}
                placeholderTextColor={tokens.colors.textTertiary}
              />
            </View>

            <View style={styles.modalFormGroup}>
              <Text style={styles.modalLabel}>Hakkımda</Text>
              <TextInput
                style={[styles.modalInput, styles.bioInput]}
                placeholder="Kendiniz hakkında bir şeyler yazınız..."
                value={editForm.bio}
                onChangeText={(text) =>
                  setEditForm({ ...editForm, bio: text })
                }
                editable={!isSubmitting}
                placeholderTextColor={tokens.colors.textTertiary}
                multiline={true}
                numberOfLines={4}
              />
            </View>

            <View style={styles.modalButtonGroup}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeEditModal}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalButton,
                  styles.saveButton,
                  isSubmitting && styles.saveButtonDisabled,
                ]}
                onPress={handleSaveProfile}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={tokens.colors.background} size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Kaydet</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tokens.colors.pageBackground,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
    shadowColor: tokens.colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  heroWide: {
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: tokens.colors.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: tokens.colors.primary,
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
    color: tokens.colors.primary,
  },
  heroSub: {
    marginTop: 2,
    color: tokens.colors.contrast,
    fontWeight: '500',
    fontSize: 13,
  },
  logoutButton: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: tokens.colors.errorLight,
    shadowColor: tokens.colors.error,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: tokens.colors.error,
    letterSpacing: 0.3,
  },
  errorBox: {
    backgroundColor: tokens.colors.successLight,
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderLeftWidth: 4,
    borderLeftColor: tokens.colors.error,
  },
  errorEmoji: {
    fontSize: 18,
  },
  errorText: {
    color: tokens.colors.error,
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
    backgroundColor: tokens.colors.surface,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.borderStrong,
    shadowColor: tokens.colors.primary,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: tokens.colors.primary,
  },
  statName: {
    fontSize: 11,
    color: tokens.colors.contrast,
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
    borderColor: tokens.colors.borderStrong,
    backgroundColor: tokens.colors.surface,
    padding: 16,
    gap: 12,
    shadowColor: tokens.colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
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
    color: tokens.colors.primary,
  },
  infoRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.secondaryLight,
    gap: 4,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: tokens.colors.contrast,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    color: tokens.colors.text,
    fontWeight: '500',
  },
  placeholder: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: tokens.colors.border,
    padding: 24,
    alignItems: 'center',
    backgroundColor: tokens.colors.surfaceMuted,
  },
  placeholderEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  placeholderText: {
    color: tokens.colors.contrast,
    fontSize: 13,
    fontWeight: '500',
  },
  primaryButton: {
    borderRadius: 12,
    backgroundColor: tokens.colors.primary,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: tokens.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    color: tokens.colors.background,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  editButton: {
    backgroundColor: tokens.colors.secondaryLight,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: tokens.colors.secondary,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: tokens.colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: tokens.colors.overlayScrim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: tokens.colors.background,
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: tokens.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: tokens.colors.primary,
  },
  modalCloseButton: {
    fontSize: 24,
    color: tokens.colors.textSecondary,
    fontWeight: '400',
  },
  editErrorBox: {
    backgroundColor: tokens.colors.errorLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: tokens.colors.error,
  },
  editErrorText: {
    color: tokens.colors.error,
    fontSize: 13,
    fontWeight: '500',
  },
  modalFormGroup: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: tokens.colors.contrast,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: tokens.colors.text,
    backgroundColor: tokens.colors.primaryLighter,
  },
  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalButtonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: tokens.colors.backgroundTertiary,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.textSecondary,
  },
  saveButton: {
    backgroundColor: tokens.colors.primary,
    shadowColor: tokens.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.background,
  },
})