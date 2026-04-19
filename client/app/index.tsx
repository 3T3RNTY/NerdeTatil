import { Link } from 'expo-router'
import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import { AppHeader } from '@/src/components/AppHeader'
import { ImagePlaceholder } from '@/src/components/ImagePlaceholder'
import { PageShell } from '@/src/components/PageShell'
import { MOCK_ITEMS } from '@/src/constants/mockData'

export default function HomeScreen() {
  const { width } = useWindowDimensions()
  const isWideWeb = Platform.OS === 'web' && width >= 920

  return (
    <View style={styles.screen}>
      <AppHeader />
      <PageShell>
        <View style={styles.titleArea}>
          <Text style={styles.title}>Kesfet</Text>
          <Text style={styles.subtitle}>Siradaki tatilini secmek icin paylasimlari incele.</Text>
        </View>

        <View style={[styles.list, isWideWeb && styles.listWide]}>
          {MOCK_ITEMS.map((item) => (
            <View key={item.id} style={[styles.card, isWideWeb && styles.cardWide]}>
              <ImagePlaceholder style={isWideWeb ? styles.cardImageWide : undefined} />
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
                <Text style={styles.score}>★ {item.puan}</Text>
                <Link href={`/detay/${item.id}` as const} asChild>
                  <Pressable style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Incele</Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          ))}
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
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 15,
    color: '#475569',
  },
  list: {
    gap: 14,
  },
  listWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe4ef',
    overflow: 'hidden',
  },
  cardWide: {
    width: '48%',
  },
  cardImageWide: {
    minHeight: 200,
  },
  cardBody: {
    padding: 14,
    gap: 8,
  },
  cardTitle: {
    fontSize: 20,
    color: '#0f172a',
    fontWeight: '700',
  },
  cardDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  score: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '700',
  },
  actionButton: {
    marginTop: 4,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: '#0d9488',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '700',
  },
})
