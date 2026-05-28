import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Animated,
} from 'react-native'
import { Link, useRouter } from 'expo-router'
import { useAuth } from '../src/hooks/useAuth'
import { tokens } from '@/src/theme/tokens'

export default function LoginScreen() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [validationError, setValidationError] = useState('')
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  const emailInputStyle = StyleSheet.flatten([styles.inputWrapper, emailFocused && styles.inputWrapperFocused])
  const passwordInputStyle = StyleSheet.flatten([styles.inputWrapper, passwordFocused && styles.inputWrapperFocused])
  const buttonStyle = StyleSheet.flatten([styles.button, isLoading && styles.buttonDisabled])

  const handleLogin = async () => {
    try {
      setValidationError('')
      clearError()

      if (!email || !password) {
        setValidationError('Email and password are required')
        return
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setValidationError('Invalid email format')
        return
      }

      await login(email, password)
      router.replace('/')
    } catch (err: any) {
      const errorMessage = err?.error || err?.message || 'Login failed'
      setValidationError(errorMessage)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.backgroundGradient} />
      
      <View style={styles.header}>
        <Text style={styles.title}>🌍 NerdeTatil</Text>
        <Text style={styles.subtitle}>Seyahat deneyimlerini keşfet ve paylaş</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.heading}>Giriş Yap</Text>

        {(validationError || error) && (
          <View style={styles.errorBox}>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.errorText}>{validationError || error}</Text>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <View style={emailInputStyle}>
            <TextInput
              style={styles.input}
              placeholder="example@email.com"
              placeholderTextColor={tokens.colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Şifre</Text>
          <View style={passwordInputStyle}>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={tokens.colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
              secureTextEntry
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
          </View>
        </View>

        <TouchableOpacity
          style={buttonStyle}
          onPress={handleLogin}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color={tokens.colors.background} />
          ) : (
            <Text style={styles.buttonText}>Giriş Yap</Text>
          )}
        </TouchableOpacity>

        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>Hesabın yok mu? </Text>
          <Link href="/register" asChild>
            <TouchableOpacity>
              <Text style={styles.linkButton}>Kaydol</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.secondaryLighter,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: tokens.colors.secondaryLighter,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 8,
    color: tokens.colors.primary,
  },
  subtitle: {
    fontSize: 14,
    color: tokens.colors.secondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: tokens.colors.primaryLighter,
    borderRadius: 24,
    padding: 28,
    shadowColor: tokens.colors.primary,
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
    borderWidth: 1,
    borderColor: tokens.colors.secondaryLight,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
    color: tokens.colors.primary,
  },
  errorBox: {
    backgroundColor: tokens.colors.successLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: tokens.colors.primary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    borderRadius: 12,
    backgroundColor: tokens.colors.secondaryLighter,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    shadowColor: tokens.colors.shadow,
    shadowOffset: { width: -3, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  inputWrapperFocused: {
    borderColor: tokens.colors.primary,
    shadowColor: tokens.colors.primary,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: tokens.colors.text,
    fontWeight: '500',
  },
  button: {
    backgroundColor: tokens.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 28,
    shadowColor: tokens.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: tokens.colors.background,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border,
  },
  linkText: {
    color: tokens.colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  linkButton: {
    color: tokens.colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
})
