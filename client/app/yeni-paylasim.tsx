import { Platform, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native'
import { AppHeader } from '@/src/components/AppHeader'
import { ImagePlaceholder } from '@/src/components/ImagePlaceholder'
import { PageShell } from '@/src/components/PageShell'

export default function CreatePostScreen() {
  const { width } = useWindowDimensions()
  const isWideWeb = Platform.OS === 'web' && width >= 980

  return (
    <View style={styles.screen}>
      <AppHeader />
      <PageShell>
        <View style={styles.titleArea}>
          <Text style={styles.title}>Yeni paylasim</Text>
          <Text style={styles.subtitle}>Fotograflari ekle ve deneyimini anlat.</Text>
        </View>

        <View style={[styles.layout, isWideWeb && styles.layoutWide]}>
          <View style={[styles.card, isWideWeb && styles.mediaCardWide]}>
            <Text style={styles.sectionTitle}>Gorseller</Text>
            <View style={[styles.imageGrid, isWideWeb && styles.imageGridWide]}>
              <ImagePlaceholder compact style={isWideWeb ? styles.compactImageWide : undefined} />
              <ImagePlaceholder compact style={isWideWeb ? styles.compactImageWide : undefined} />
            </View>
            <Pressable style={styles.outlineButton}>
              <Text style={styles.outlineButtonText}>Resim Ekle</Text>
            </Pressable>
          </View>

          <View style={[styles.card, isWideWeb && styles.textCardWide]}>
            <Text style={styles.sectionTitle}>Aciklama</Text>
            <TextInput
              style={[styles.textArea, isWideWeb && styles.textAreaWide]}
              placeholder="Nerede kaldin, ne yaptin, ne onerirsin?"
              placeholderTextColor="#64748b"
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.footerActions}>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Paylas</Text>
          </Pressable>
          <Pressable style={styles.iconButton}>
            <Text style={styles.iconButtonText}>+</Text>
          </Pressable>
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
  titleArea: {
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#dbe4ef',
    backgroundColor: '#ffffff',
    padding: 14,
    gap: 10,
  },
  layout: {
    gap: 14,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  imageGrid: {
    gap: 10,
  },
  imageGridWide: {
    flexDirection: 'row',
  },
  compactImageWide: {
    flex: 1,
  },
  outlineButton: {
    minHeight: 40,
    borderWidth: 1,
    borderColor: '#5eead4',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdfa',
  },
  outlineButtonText: {
    fontSize: 14,
    color: '#0f766e',
    fontWeight: '700',
  },
  textArea: {
    minHeight: 220,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    padding: 12,
    fontSize: 15,
    color: '#0f172a',
  },
  textAreaWide: {
    minHeight: 300,
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: '#0d9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  iconButtonText: {
    color: '#0f172a',
    fontSize: 24,
    lineHeight: 26,
  },
})
