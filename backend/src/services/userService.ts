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
  static async getUserProfile(userId: string) {
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

    return {
      ...user,
      postsCount,
      commentsCount,
      followersCount,
      followingCount,
    };
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
