import { useState } from 'react'
import { Pressable, StyleSheet, Text, ActivityIndicator } from 'react-native'
import { tokens } from '@/src/theme/tokens'
import { UserService } from '@/src/api/userService'

type FollowButtonProps = {
  userId: string
  initialFollowing: boolean
  compact?: boolean
  onChange?: (following: boolean) => void
}

export function FollowButton({
  userId,
  initialFollowing,
  compact = false,
  onChange,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)

  const handlePress = async () => {
    if (loading) return
    try {
      setLoading(true)
      if (following) {
        await UserService.unfollowUser(userId)
        setFollowing(false)
        onChange?.(false)
      } else {
        await UserService.followUser(userId)
        setFollowing(true)
        onChange?.(true)
      }
    } catch (err) {
      console.error('Follow toggle error:', err)
    } finally {
      setLoading(false)
    }
  }

  const buttonStyle = StyleSheet.flatten([
    styles.button,
    compact && styles.buttonCompact,
    following && styles.buttonFollowing,
  ])

  return (
    <Pressable style={buttonStyle} onPress={handlePress} disabled={loading}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={following ? tokens.colors.primary : tokens.colors.navBarForeground}
        />
      ) : (
        <Text style={StyleSheet.flatten([styles.text, following && styles.textFollowing])}>
          {following ? 'Takipten Çık' : 'Takip Et'}
        </Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: tokens.borderRadius.lg,
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[2],
    backgroundColor: tokens.colors.primary,
    borderWidth: 1,
    borderColor: tokens.colors.primaryDark,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonCompact: {
    paddingHorizontal: tokens.spacing[3],
    paddingVertical: 6,
    minWidth: 88,
  },
  buttonFollowing: {
    backgroundColor: tokens.colors.surface,
    borderColor: tokens.colors.borderStrong,
  },
  text: {
    color: tokens.colors.navBarForeground,
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: '700',
  },
  textFollowing: {
    color: tokens.colors.primaryDark,
  },
})
