import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class PostService {
  /**
   * Get all public posts with pagination
   */
  static async getPosts(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { isPublic: true },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profileImageUrl: true,
            },
          },
          location: {
            select: {
              id: true,
              name: true,
              city: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.post.count({ where: { isPublic: true } }),
    ]);

    return {
      posts: posts.map((post) => ({
        ...post,
        likesCount: post._count.likes,
        commentsCount: post._count.comments,
        _count: undefined,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get post by ID with comments
   */
  static async getPostById(postId: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImageUrl: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                profileImageUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    if (!post) return null;

    return {
      ...post,
      likesCount: post._count.likes,
      _count: undefined,
    };
  }

  /**
   * Get posts by user ID
   */
  static async getPostsByUserId(userId: string, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { userId },
        include: {
          location: {
            select: {
              id: true,
              name: true,
              city: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.post.count({ where: { userId } }),
    ]);

    return {
      posts: posts.map((post) => ({
        ...post,
        likesCount: post._count.likes,
        commentsCount: post._count.comments,
        _count: undefined,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create a new post
   */
  static async createPost(data: {
    userId: string;
    locationId: string;
    title?: string;
    description: string;
    rating?: number;
    imageUrls?: string[];
  }) {
    return prisma.post.create({
      data: {
        userId: data.userId,
        locationId: data.locationId,
        title: data.title,
        description: data.description,
        rating: data.rating,
        imageUrls: data.imageUrls || [],
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImageUrl: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
      },
    });
  }

  /**
   * Update post
   */
  static async updatePost(postId: string, data: Prisma.PostUpdateInput) {
    return prisma.post.update({
      where: { id: postId },
      data,
      include: {
        user: true,
        location: true,
      },
    });
  }

  /**
   * Delete post
   */
  static async deletePost(postId: string) {
    return prisma.post.delete({
      where: { id: postId },
    });
  }

  /**
   * Add comment to post
   */
  static async addComment(data: {
    postId: string;
    userId: string;
    content: string;
  }) {
    return prisma.comment.create({
      data: {
        postId: data.postId,
        userId: data.userId,
        content: data.content,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImageUrl: true,
          },
        },
      },
    });
  }

  /**
   * Get comments for post
   */
  static async getPostComments(postId: string) {
    return prisma.comment.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImageUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Like a post
   */
  static async likePost(postId: string, userId: string, reactionType: string = 'like') {
    return prisma.like.upsert({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
      create: {
        postId,
        userId,
        reactionType,
      },
      update: {
        reactionType,
      },
    });
  }

  /**
   * Unlike a post
   */
  static async unlikePost(postId: string, userId: string) {
    return prisma.like.deleteMany({
      where: {
        postId,
        userId,
      },
    });
  }

  /**
   * Get likes count for post
   */
  static async getLikesCount(postId: string) {
    return prisma.like.count({
      where: { postId },
    });
  }

  /**
   * Check if user liked post
   */
  static async hasUserLikedPost(postId: string, userId: string) {
    const like = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });
    return !!like;
  }
}
