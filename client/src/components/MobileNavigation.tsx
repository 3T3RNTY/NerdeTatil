import { Link, usePathname } from 'expo-router'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'

interface NavItem {
  label: string
  icon: string
  href: string
  activeRoutes: string[]
}

const navItems: NavItem[] = [
  {
    label: 'Keşfet',
    icon: '🏠',
    href: '/',
    activeRoutes: ['/'],
  },
  {
    label: 'Paylaş',
    icon: '➕',
    href: '/yeni-paylasim',
    activeRoutes: ['/yeni-paylasim'],
  },
  {
    label: 'Profil',
    icon: '👤',
    href: '/profil',
    activeRoutes: ['/profil', '/user-posts'],
  },
]

export function MobileNavigation() {
  const pathname = usePathname()

  // Don't show on auth screens
  if (pathname === '/login' || pathname === '/register') {
    return null
  }

  const isActive = (activeRoutes: string[]) => activeRoutes.includes(pathname)

  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const active = isActive(item.activeRoutes)
        const buttonStyle = StyleSheet.flatten([styles.button, active && styles.buttonActive])
        const labelStyle = StyleSheet.flatten([styles.label, active && styles.labelActive])

        return (
          <Link key={item.href} href={item.href} asChild>
            <Pressable style={buttonStyle}>
              <Text style={styles.icon}>{item.icon}</Text>
              <Text style={labelStyle}>{item.label}</Text>
            </Pressable>
          </Link>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#d1f3ed',
    backgroundColor: '#f0fdf9',
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    height: Platform.OS === 'ios' ? 80 : 60,
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  button: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    opacity: 0.6,
  },
  buttonActive: {
    opacity: 1,
  },
  icon: {
    fontSize: 24,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0f766e',
  },
  labelActive: {
    color: '#0d9488',
  },
})
