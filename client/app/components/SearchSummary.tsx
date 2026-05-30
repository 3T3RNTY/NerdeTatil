import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native'
import { tokens } from '@/src/theme/tokens'

interface SearchSummaryProps {
  summary: string
  loading?: boolean
  onRefresh?: () => void
  cached?: boolean
}

export function SearchSummary({
  summary,
  loading = false,
  onRefresh,
  cached = false,
}: SearchSummaryProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.badge}>🤖 AI Özeti</Text>
        {cached && <Text style={styles.cachedLabel}>Önbelleğe alındı</Text>}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={tokens.colors.primary} />
          <Text style={styles.loadingText}>Özet oluşturuluyor...</Text>
        </View>
      ) : (
        <>
          <Text style={styles.summaryText}>{summary}</Text>

          {onRefresh && (
            <Pressable style={styles.refreshButton} onPress={onRefresh} disabled={loading}>
              <Text style={styles.refreshButtonText}>🔄 Yenile</Text>
            </Pressable>
          )}
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: tokens.colors.primary + '15',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: tokens.colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badge: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.primary,
  },
  cachedLabel: {
    fontSize: 11,
    color: tokens.colors.textTertiary,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  loadingText: {
    marginLeft: 10,
    color: tokens.colors.textSecondary,
    fontSize: 14,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
    color: tokens.colors.textPrimary,
    marginBottom: 12,
  },
  refreshButton: {
    backgroundColor: tokens.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  refreshButtonText: {
    color: tokens.colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
})
