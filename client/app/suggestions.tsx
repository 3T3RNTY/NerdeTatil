import { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { AppHeader } from '@/src/components/AppHeader'
import { PageShell } from '@/src/components/PageShell'
import {
  PersonalizedSuggestionsResponse,
  PostService,
} from '@/src/api/postService'
import { useAuth } from '@/src/hooks/useAuth'
import { tokens } from '@/src/theme/tokens'

export default function SuggestionsScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<PersonalizedSuggestionsResponse | null>(null)

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      setError('Öneriler için giriş yapmanız gerekiyor.')
      return
    }
    fetchSuggestions(user.id)
  }, [user?.id])

  const fetchSuggestions = async (userId: string) => {
    try {
      setLoading(true)
      setError(null)
      const result = await PostService.getPersonalizedSuggestions(userId)
      setData(result)
    } catch (err: any) {
      setError(err?.error || 'Öneriler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  /*
  * fetchSuggestions function - retrieves personalized location suggestions from the API using the PostService. Manages loading and error states, and updates the data state with the retrieved suggestions. Called on component mount when user ID is available.
  */

  return (
    <View style={styles.screen}>
      <AppHeader />
      <PageShell>
        <View style={styles.titleArea}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Geri</Text>
          </Pressable>
          <Text style={styles.title}>AI Yer Önerileri</Text>
          <Text style={styles.subtitle}>
            Paylaşımların ve beğenilerin temel alınarak hazırlandı
          </Text>
        </View>

        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={tokens.colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>AI Özeti</Text>
              <Text style={styles.summaryText}>
                {data?.summary || 'Öneri özeti bulunamadı.'}
              </Text>
            </View>

            <View style={styles.list}>
              {(data?.suggestions || []).length === 0 ? (
                <Text style={styles.emptyText}>Henüz öneri bulunamadı.</Text>
              ) : (
                data!.suggestions.map((item, index) => (
                  <View key={`${item.location}-${index}`} style={styles.card}>
                    <Text style={styles.location}>{item.location}</Text>
                    <Text style={styles.reason}>{item.reason}</Text>
                    <Text style={styles.source}>
                      Kaynak:{' '}
                      {item.source === 'mixed'
                        ? 'Paylaşımlar + Beğeniler'
                        : item.source === 'liked'
                          ? 'Beğeniler'
                          : 'Paylaşımlar'}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </PageShell>
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
    paddingVertical: 60,
  },
  titleArea: {
    gap: 8,
    marginBottom: 20,
  },
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
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: tokens.colors.primary,
  },
  subtitle: {
    fontSize: 14,
    color: tokens.colors.textSecondary,
    fontWeight: '500',
  },
  summaryBox: {
    backgroundColor: tokens.colors.primaryLighter,
    borderLeftWidth: 4,
    borderLeftColor: tokens.colors.primary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: tokens.colors.primary,
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
    color: tokens.colors.text,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.colors.borderStrong,
    padding: 14,
    gap: 6,
  },
  location: {
    fontSize: 16,
    fontWeight: '700',
    color: tokens.colors.text,
  },
  reason: {
    fontSize: 13,
    color: tokens.colors.textSecondary,
    lineHeight: 18,
  },
  source: {
    fontSize: 12,
    color: tokens.colors.primary,
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: tokens.colors.errorLight,
    borderRadius: 12,
    padding: 14,
  },
  errorText: {
    color: tokens.colors.error,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: tokens.colors.textSecondary,
    paddingVertical: 24,
  },
})
