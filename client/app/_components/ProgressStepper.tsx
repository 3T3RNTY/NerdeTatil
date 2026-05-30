import { View, Text, StyleSheet } from 'react-native'
import { tokens } from '@/src/theme/tokens'

interface ProgressStepperProps {
  currentStep: 1 | 2 | 3 | 4
}

const steps = [
  { number: 1, label: 'Tür' },
  { number: 2, label: 'Tema' },
  { number: 3, label: 'Detaylar' },
  { number: 4, label: 'Yorum & Puan' },
]

export default function ProgressStepper({ currentStep }: ProgressStepperProps) {
  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        {/* Circles and connecting lines */}
        <View style={styles.stepperTrack}>
          {steps.map((step, index) => (
            <View key={`circle-${step.number}`} style={styles.stepWrapper}>
              {/* Connecting Line (before circle) */}
              {index > 0 && (
                <View
                  style={[
                    styles.stepLine,
                    currentStep > steps[index - 1].number
                      ? styles.stepLineActive
                      : styles.stepLineInactive,
                  ]}
                />
              )}

              {/* Step Circle */}
              <View
                style={[
                  styles.stepCircle,
                  currentStep >= step.number
                    ? styles.stepCircleActive
                    : styles.stepCircleInactive,
                ]}
              >
                {currentStep > step.number ? (
                  <Text style={styles.stepCheckmark}>✓</Text>
                ) : (
                  <Text
                    style={[
                      styles.stepNumber,
                      currentStep >= step.number && styles.stepNumberActive,
                    ]}
                  >
                    {step.number}
                  </Text>
                )}
              </View>

              {/* Connecting Line (after circle) */}
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.stepLine,
                    currentStep > step.number
                      ? styles.stepLineActive
                      : styles.stepLineInactive,
                  ]}
                />
              )}
            </View>
          ))}
        </View>

        {/* Labels */}
        <View style={styles.labelsRow}>
          {steps.map((step, index) => (
            <View key={`label-${step.number}`} style={styles.labelWrapper}>
              <Text
                style={[
                  styles.label,
                  currentStep >= step.number && styles.labelActive,
                ]}
              >
                {step.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[4],
    backgroundColor: tokens.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  stepperTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing[3],
    width: '100%',
  },
  stepWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    flexShrink: 0,
  },
  stepCircleActive: {
    backgroundColor: tokens.colors.primary,
    borderColor: tokens.colors.primary,
  },
  stepCircleInactive: {
    backgroundColor: tokens.colors.surface,
    borderColor: tokens.colors.border,
  },
  stepNumber: {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.border,
  },
  stepNumberActive: {
    color: tokens.colors.background,
  },
  stepCheckmark: {
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.background,
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: tokens.spacing[1],
  },
  stepLineActive: {
    backgroundColor: tokens.colors.primary,
  },
  stepLineInactive: {
    backgroundColor: tokens.colors.border,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  labelWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: tokens.typography.fontWeight.medium,
    color: tokens.colors.textTertiary,
    textAlign: 'center',
  },
  labelActive: {
    color: tokens.colors.primary,
    fontWeight: tokens.typography.fontWeight.semibold,
  },
})
