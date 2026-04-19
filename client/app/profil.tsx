import { Link } from 'expo-router'
import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import { AppHeader } from '@/src/components/AppHeader'
import { PageShell } from '@/src/components/PageShell'
import { PROFILE } from '@/src/constants/mockData'

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  )
}

export default function ProfileScreen() {
  const { width } = useWindowDimensions()
  const isWideWeb = Platform.OS === 'web' && width >= 980

  return (
    <View style={styles.screen}>
      <AppHeader />
      <PageShell>
        <View style={[styles.hero, isWideWeb && styles.heroWide]}>
          <Text style={styles.avatar}>👤</Text>
          <View style={styles.heroTextWrap}>
            <Text style={styles.displayName}>{PROFILE.displayName}</Text>
            <Text style={styles.heroSub}>Tatil onerilerini paylas</Text>
          </View>
          <Link href="/" asChild>
            <Pressable style={styles.backButton}>
              <Text style={styles.backButtonText}>Ana sayfa</Text>
            </Pressable>
          </Link>
        </View>

        <View style={[styles.sections, isWideWeb && styles.sectionsWide]}>
          <View style={[styles.card, isWideWeb && styles.profileCardWide]}>
            <Text style={styles.cardTitle}>Profil Detayi</Text>
            <InfoRow label="Ad Soyad" value={PROFILE.fullName} />
            <InfoRow label="E-posta" value={PROFILE.email} />
            <InfoRow label="Telefon" value={PROFILE.phone} />
            <InfoRow label="Konum" value={PROFILE.location} />
            <InfoRow label="Uyelik" value={PROFILE.memberSince} />
            <InfoRow label="Hakkimda" value={PROFILE.bio} />
          </View>

          <View style={[styles.card, isWideWeb && styles.postCardWide]}>
            <Text style={styles.cardTitle}>Paylasimlar</Text>
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Paylasimlar burada listelenecek.</Text>
            </View>
            <Link href="/yeni-paylasim" asChild>
              <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Yeni Paylasim</Text>
              </Pressable>
            </Link>
          </View>
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
  backButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    minHeight: 36,
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#dbe4ef',
    backgroundColor: '#ffffff',
    padding: 14,
    gap: 8,
  },
  sections: {
    gap: 14,
  },
  sectionsWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  profileCardWide: {
    flex: 1.15,
  },
  postCardWide: {
    flex: 0.85,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  infoRow: {
    gap: 2,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '700',
  },
  infoValue: {
    fontSize: 15,
    color: '#0f172a',
  },
  placeholder: {
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  placeholderText: {
    color: '#64748b',
  },
  primaryButton: {
    marginTop: 4,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: '#0d9488',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
})
