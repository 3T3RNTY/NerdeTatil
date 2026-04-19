import { Link, useLocalSearchParams } from 'expo-router'
import { Platform, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native'
import { AppHeader } from '@/src/components/AppHeader'
import { ImagePlaceholder } from '@/src/components/ImagePlaceholder'
import { PageShell } from '@/src/components/PageShell'
import { MOCK_COMMENTS } from '@/src/constants/mockData'

export default function DetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>()
  const { width } = useWindowDimensions()
  const isWideWeb = Platform.OS === 'web' && width >= 980

  return (
    <View style={styles.screen}>
      <AppHeader />
      <PageShell>
        <Link href="/" asChild>
          <Pressable style={styles.backButton}>
            <Text style={styles.backButtonText}>← Ana sayfa</Text>
          </Pressable>
        </Link>

        <View style={[styles.contentLayout, isWideWeb && styles.contentLayoutWide]}>
          <View style={[styles.mainColumn, isWideWeb && styles.mainColumnWide]}>
            <ImagePlaceholder style={isWideWeb ? styles.heroImageWide : undefined} />
            <Text style={styles.meta}>Oge kimligi: {params.id ?? '-'}</Text>

            <View style={styles.block}>
              <Text style={styles.blockTitle}>Aciklama</Text>
              <Text style={styles.blockText}>Paylasim ile ilgili aciklamalar.</Text>
            </View>
          </View>

          <View style={[styles.sideColumn, isWideWeb && styles.sideColumnWide]}>
            <View style={styles.scoreBox}>
              <Text style={styles.score}>★ 4.8</Text>
              <Text style={styles.scoreSub}>128 degerlendirme</Text>
            </View>

            <View style={styles.block}>
              <Text style={styles.blockTitle}>Yorumlar</Text>
              {MOCK_COMMENTS.map((comment) => (
                <View key={comment.id} style={styles.commentRow}>
                  <Text style={styles.commentUser}>{comment.user}</Text>
                  <Text style={styles.commentText}>{comment.text}</Text>
                </View>
              ))}
            </View>

            <View style={styles.commentComposer}>
              <TextInput style={styles.commentInput} placeholder="Yorumunu yaz..." placeholderTextColor="#64748b" />
              <Pressable style={styles.sendButton}>
                <Text style={styles.sendButtonText}>+</Text>
              </Pressable>
            </View>
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
  meta: {
    color: '#64748b',
    fontSize: 13,
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
  },
  commentRow: {
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 10,
    gap: 4,
  },
  commentUser: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  commentText: {
    color: '#334155',
  },
  commentComposer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
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
  sendButtonText: {
    color: '#ffffff',
    fontSize: 24,
    lineHeight: 26,
    fontWeight: '600',
  },
})
