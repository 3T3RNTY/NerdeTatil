import { Link } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { UserSummary } from '@/src/api/userService'
import { tokens } from '@/src/theme/tokens'
import { FollowButton } from './FollowButton'
import { useAuth } from '@/src/hooks/useAuth'

type UserListItemProps = {
  user: UserSummary
  onFollowChange?: (userId: string, following: boolean) => void
}

export function UserListItem({ user, onFollowChange }: UserListItemProps) {
  const { user: currentUser } = useAuth()
  const showFollow = currentUser && currentUser.id !== user.id

  return (
    <View style={styles.row}>
      <Link href={`/kullanici/${user.id}`} asChild>
        <Pressable style={styles.profileArea}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user.username || '?').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.name}>{user.fullName || user.username}</Text>
            <Text style={styles.username}>@{user.username}</Text>
            {user.bio ? (
              <Text style={styles.bio} numberOfLines={2}>
                {user.bio}
              </Text>
            ) : null}
          </View>
        </Pressable>
      </Link>
      {showFollow ? (
        <FollowButton
          userId={user.id}
          initialFollowing={!!user.isFollowing}
          compact
          onChange={(following) => onFollowChange?.(user.id, following)}
        />
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[3],
    padding: tokens.spacing[4],
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.borderRadius.md,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginBottom: tokens.spacing[2],
  },
  profileArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[3],
    minWidth: 0,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: tokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: tokens.colors.navBarForeground,
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: '700',
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  name: {
    fontSize: tokens.typography.fontSize.base,
    fontWeight: '700',
    color: tokens.colors.text,
  },
  username: {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.textSecondary,
  },
  bio: {
    fontSize: tokens.typography.fontSize.xs,
    color: tokens.colors.textTertiary,
    marginTop: 2,
  },
})
