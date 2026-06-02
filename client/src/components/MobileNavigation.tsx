import { Link, usePathname } from 'expo-router'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { tokens } from '@/src/theme/tokens'

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
    borderTopColor: tokens.colors.navBarDark,
    backgroundColor: tokens.colors.navBar,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: tokens.spacing[2],
    height: Platform.OS === 'ios' ? 80 : 60,
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  button: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing[1],
    paddingVertical: tokens.spacing[2],
    opacity: 0.6,
  },
  buttonActive: {
    opacity: 1,
  },
  icon: {
    fontSize: tokens.typography.fontSize['2xl'],
  },
  label: {
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: tokens.typography.fontWeight.semibold as any,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  labelActive: {
    color: tokens.colors.navBarForeground,
    fontWeight: tokens.typography.fontWeight.bold as any,
  },
})
