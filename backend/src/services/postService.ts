import { PrismaClient, Prisma, PostCategory } from '@prisma/client';

const prisma = new PrismaClient();

interface LocationData {
  id?: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  visitDate?: string; // ISO date string
}

interface CreatePostInput {
  userId: string;
  category: PostCategory;
  title?: string;
  description: string;
  rating?: number;
  imageUrls?: string[];
  locations: LocationData[];
  startDate?: string; // ISO date string for TRIP category
  endDate?: string; // ISO date string for TRIP category
  metadata?: {
    mealType?: string; // For FOOD_PLACE
    priceRange?: string; // For FOOD_PLACE, HOTEL
    amenities?: string[]; // For HOTEL
    hours?: string; // For ATTRACTION
    [key: string]: any;
  };
}

interface UpdatePostInput {
  title?: string;
  description?: string;
  rating?: number;
  imageUrls?: string[];
  locations?: LocationData[];
  startDate?: string;
  endDate?: string;
  metadata?: Record<string, any>;
}

export class PostService {
  /**
   * Get all public posts with pagination
   */
  static async getPosts(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { isPublic: true },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          rating: true,
          imageUrls: true,
          locationsData: true,
          startDate: true,
          endDate: true,
          metadata: true,
          isPublic: true,
          allowComments: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
          user: {
            select: {
              id: true,
              username: true,
              profileImageUrl: true,
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
        locations: post.locationsData as unknown as LocationData[],
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
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        rating: true,
        imageUrls: true,
        locationsData: true,
        startDate: true,
        endDate: true,
        metadata: true,
        isPublic: true,
        allowComments: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        user: {
          select: {
            id: true,
            username: true,
            profileImageUrl: true,
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
      locations: post.locationsData as unknown as LocationData[],
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
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          rating: true,
          imageUrls: true,
          locationsData: true,
          startDate: true,
          endDate: true,
          metadata: true,
          isPublic: true,
          allowComments: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
          user: {
            select: {
              id: true,
              username: true,
              profileImageUrl: true,
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
        locations: post.locationsData as unknown as LocationData[],
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
   * Create a new post with multiple locations and category
   */
  static async createPost(data: CreatePostInput) {
    // Validate required fields
    if (!data.userId || !data.description || !data.locations || data.locations.length === 0) {
      throw new Error('Missing required fields: userId, description, locations');
    }

    return prisma.post.create({
      data: {
        userId: data.userId,
        category: data.category,
        title: data.title,
        description: data.description,
        rating: data.rating,
        imageUrls: data.imageUrls || [],
        locationsData: data.locations as unknown as Prisma.InputJsonValue,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        metadata: data.metadata || {},
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        rating: true,
        imageUrls: true,
        locationsData: true,
        startDate: true,
        endDate: true,
        metadata: true,
        isPublic: true,
        allowComments: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        user: {
          select: {
            id: true,
            username: true,
            profileImageUrl: true,
          },
        },
      },
    }).then((post) => ({
      ...post,
      locations: post.locationsData as unknown as LocationData[],
    }));
  }

  /**
   * Update post
   */
  static async updatePost(postId: string, data: UpdatePostInput) {
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.imageUrls !== undefined) updateData.imageUrls = data.imageUrls;
    if (data.locations !== undefined) updateData.locationsData = data.locations;
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.metadata !== undefined) updateData.metadata = data.metadata;

    return prisma.post.update({
      where: { id: postId },
      data: updateData,
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        rating: true,
        imageUrls: true,
        locationsData: true,
        startDate: true,
        endDate: true,
        metadata: true,
        isPublic: true,
        allowComments: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        user: {
          select: {
            id: true,
            username: true,
            profileImageUrl: true,
          },
        },
      },
    }).then((post) => ({
      ...post,
      locations: post.locationsData as unknown as LocationData[],
    }));
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
  static async addComment(data: { postId: string; userId: string; content: string }) {
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
