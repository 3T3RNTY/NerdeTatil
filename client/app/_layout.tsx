import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { AuthProvider, AuthContext } from '../src/context/AuthContext'
import { useContext } from 'react'

function RootLayoutNav() {
  const authContext = useContext(AuthContext)
  const isAuthenticated = authContext?.isAuthenticated ?? false
  const isLoading = authContext?.isLoading ?? true
  const router = useRouter()
  const segments = useSegments()

  // Handle auth state changes
  useEffect(() => {
    if (isLoading) return

    // Determine if we're in auth flow or app flow
    const inAuthFlow = segments[0] === 'login' || segments[0] === 'register'

    if (!isAuthenticated && !inAuthFlow) {
      // Redirect to login if not authenticated
      router.replace('/login')
    } else if (isAuthenticated && inAuthFlow) {
      // Redirect to home if authenticated but in auth flow
      router.replace('/')
    }
  }, [isAuthenticated, isLoading, segments])

  if (isLoading) {
    return null // Show splash screen while loading
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#f1f5f9' },
        }}
      >
        {/* Auth screens - always defined */}
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        
        {/* Main app screens - always defined */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="profil" options={{ headerShown: false }} />
        <Stack.Screen name="yeni-paylasim" options={{ headerShown: false }} />
        <Stack.Screen name="detay/[id]" options={{ headerShown: false }} />
      </Stack>
    </>
  )
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  )
}
