import { Platform, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native'
import { useRouter } from 'expo-router'
import { AppHeader } from '@/src/components/AppHeader'
import { ImagePlaceholder } from '@/src/components/ImagePlaceholder'
import { PageShell } from '@/src/components/PageShell'

export default function CreatePostScreen() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const isWideWeb = Platform.OS === 'web' && width >= 980

  return (
    <View style={styles.screen}>
      <AppHeader />
      <PageShell>
        <View style={styles.titleArea}>
          <View style={styles.titleHeader}>
            <View>
              <Text style={styles.title}>✍️ Yeni Paylaşım</Text>
              <Text style={styles.subtitle}>Deneyimlerini fotoğraflarla anlatarak başka seyahatseverleri ilham ver</Text>
            </View>
            <Pressable style={styles.exitButton} onPress={() => router.back()}>
              <Text style={styles.exitButtonText}>✕</Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.layout, isWideWeb && styles.layoutWide]}>
          <View style={[styles.card, isWideWeb && styles.mediaCardWide]}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionEmoji}>📸</Text>
              <Text style={styles.sectionTitle}>Görseller</Text>
            </View>
            <View style={[styles.imageGrid, isWideWeb && styles.imageGridWide]}>
              <ImagePlaceholder compact style={isWideWeb ? styles.compactImageWide : undefined} />
              <ImagePlaceholder compact style={isWideWeb ? styles.compactImageWide : undefined} />
            </View>
            <Pressable style={styles.outlineButton}>
              <Text style={styles.outlineButtonEmoji}>+</Text>
              <Text style={styles.outlineButtonText}>Resim Ekle</Text>
            </Pressable>
          </View>

          <View style={[styles.card, isWideWeb && styles.textCardWide]}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionEmoji}>✏️</Text>
              <Text style={styles.sectionTitle}>Açıklama</Text>
            </View>
            <TextInput
              style={[styles.textArea, isWideWeb && styles.textAreaWide]}
              placeholder="Nerede kaldın, ne yaptın, ne önerirsin? Başka seyahatseverleri ilham ver..."
              placeholderTextColor="#9ca3af"
              multiline
              textAlignVertical="top"
            />
            
            <View style={styles.tagsSection}>
              <Text style={styles.tagsLabel}>Etiketler:</Text>
              <View style={styles.tagsContainer}>
                <Pressable style={styles.tag}>
                  <Text style={styles.tagText}>#tatil</Text>
                </Pressable>
                <Pressable style={styles.tag}>
                  <Text style={styles.tagText}>#seyahat</Text>
                </Pressable>
                <Pressable style={styles.tag}>
                  <Text style={styles.tagText}>#fotoğraf</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footerActions}>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonEmoji}>📤</Text>
            <Text style={styles.primaryButtonText}>Paylaş</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonEmoji}>💾</Text>
            <Text style={styles.secondaryButtonText}>Taslak Kaydet</Text>
          </Pressable>
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
  titleArea: {
    marginBottom: 20,
  },
  titleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0d9488',
  },
  subtitle: {
    fontSize: 14,
    color: '#0f766e',
    fontWeight: '500',
    lineHeight: 20,
    marginTop: 4,
  },
  exitButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  exitButtonText: {
    fontSize: 22,
    color: '#dc2626',
    fontWeight: '700',
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ccf0e8',
    backgroundColor: '#f0fdf9',
    padding: 16,
    gap: 14,
    shadowColor: '#0d9488',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  layout: {
    gap: 16,
  },
  layoutWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 16,
  },
  mediaCardWide: {
    flex: 1,
  },
  textCardWide: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionEmoji: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0d9488',
  },
  imageGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  imageGridWide: {
    gap: 12,
  },
  compactImageWide: {
    minHeight: 120,
  },
  outlineButton: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccf0e8',
    backgroundColor: '#e8f5f1',
    paddingVertical: 14,
    alignItems: 'center',
    gap: 6,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  outlineButtonEmoji: {
    fontSize: 18,
  },
  outlineButtonText: {
    color: '#0d9488',
    fontSize: 14,
    fontWeight: '700',
  },
  textArea: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccf0e8',
    backgroundColor: '#e8f5f1',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
    minHeight: 120,
  },
  textAreaWide: {
    minHeight: 180,
  },
  tagsSection: {
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#d1f3ed',
  },
  tagsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f766e',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#0d9488',
    backgroundColor: '#d1f3ed',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0d9488',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#0d9488',
    paddingVertical: 14,
    alignItems: 'center',
    gap: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonEmoji: {
    fontSize: 18,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccf0e8',
    backgroundColor: '#e8f5f1',
    paddingVertical: 14,
    alignItems: 'center',
    gap: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonEmoji: {
    fontSize: 18,
  },
  secondaryButtonText: {
    color: '#0d9488',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
})
