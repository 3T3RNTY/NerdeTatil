import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export class UserService {
  /**
   * Create a new user with hashed password
   */
  static async createUser(data: {
    email: string;
    username: string;
    password: string;
    fullName?: string;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        passwordHash: hashedPassword,
        fullName: data.fullName,
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        createdAt: true,
      },
    });
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        bio: true,
        profileImageUrl: true,
        createdAt: true,
      },
    });
  }

  /**
   * Get user by email (for login)
   */
  static async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        passwordHash: true,
      },
    });
  }

  /**
   * Verify password
   */
  static async verifyPassword(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Get user profile with stats
   */
  static async getUserProfile(userId: string, viewerId?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        bio: true,
        profileImageUrl: true,
        createdAt: true,
      },
    });

    if (!user) return null;

    const [postsCount, commentsCount, followersCount, followingCount] =
      await Promise.all([
        prisma.post.count({ where: { userId } }),
        prisma.comment.count({ where: { userId } }),
        prisma.userFollow.count({ where: { followingId: userId } }),
        prisma.userFollow.count({ where: { followerId: userId } }),
      ]);

    let isFollowing = false;
    if (viewerId && viewerId !== userId) {
      const follow = await prisma.userFollow.findUnique({
        where: {
          followerId_followingId: {
            followerId: viewerId,
            followingId: userId,
          },
        },
      });
      isFollowing = !!follow;
    }

    return {
      ...user,
      postsCount,
      commentsCount,
      followersCount,
      followingCount,
      isFollowing,
      isOwnProfile: viewerId === userId,
    };
  }

  /**
   * Follow a user
   */
  static async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }

    const target = await prisma.user.findUnique({ where: { id: followingId } });
    if (!target) {
      throw new Error('User not found');
    }

    await prisma.userFollow.upsert({
      where: {
        followerId_followingId: { followerId, followingId },
      },
      create: { followerId, followingId },
      update: {},
    });

    return { following: true };
  }

  /**
   * Unfollow a user
   */
  static async unfollowUser(followerId: string, followingId: string) {
    await prisma.userFollow.deleteMany({
      where: { followerId, followingId },
    });
    return { following: false };
  }

  private static userSummarySelect = {
    id: true,
    username: true,
    fullName: true,
    bio: true,
    profileImageUrl: true,
  };

  /**
   * Users who follow this user (followers)
   */
  static async getFollowers(
    userId: string,
    page: number = 1,
    limit: number = 20,
    viewerId?: string
  ) {
    const offset = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      prisma.userFollow.findMany({
        where: { followingId: userId },
        select: {
          createdAt: true,
          follower: { select: UserService.userSummarySelect },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.userFollow.count({ where: { followingId: userId } }),
    ]);

    const users = await UserService.attachFollowingFlags(
      rows.map((r) => ({ ...r.follower, followedAt: r.createdAt })),
      viewerId
    );

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Users this user follows
   */
  static async getFollowing(
    userId: string,
    page: number = 1,
    limit: number = 20,
    viewerId?: string
  ) {
    const offset = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      prisma.userFollow.findMany({
        where: { followerId: userId },
        select: {
          createdAt: true,
          following: { select: UserService.userSummarySelect },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.userFollow.count({ where: { followerId: userId } }),
    ]);

    const users = await UserService.attachFollowingFlags(
      rows.map((r) => ({ ...r.following, followedAt: r.createdAt })),
      viewerId
    );

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  private static async attachFollowingFlags<
    T extends { id: string } & Record<string, unknown>,
  >(users: T[], viewerId?: string) {
    if (!viewerId || users.length === 0) {
      return users.map((u) => ({ ...u, isFollowing: false }));
    }

    const targetIds = users.map((u) => u.id).filter((id) => id !== viewerId);
    const follows = await prisma.userFollow.findMany({
      where: {
        followerId: viewerId,
        followingId: { in: targetIds },
      },
      select: { followingId: true },
    });
    const followingSet = new Set(follows.map((f) => f.followingId));

    return users.map((u) => ({
      ...u,
      isFollowing: u.id !== viewerId && followingSet.has(u.id),
    }));
  }

  /**
   * Update user profile
   */
  static async updateUser(userId: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        bio: true,
        profileImageUrl: true,
      },
    });
  }
}
