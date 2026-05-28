import { PrismaClient, Prisma, PostType } from '@prisma/client';
import { ThemeService } from './themeService';
import geocodingService from './geocodingService';

const prisma = new PrismaClient();

interface LocationData {
  id?: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  // Location-specific ratings (for TRIP posts only)
  rating?: number; // 1-5 overall rating for this location
  description?: string; // User's review/description for this location
  multiCriteriaRatings?: MultiCriteriaRatings; // Per-location multi-criteria ratings
}

interface MultiCriteriaRatings {
  optionVariety?: number; // 1-5
  location?: number; // 1-5
  accessibility?: number; // 1-5
  priceValue?: number; // 1-5
}

interface CreatePostInput {
  userId: string;
  postType: PostType; // TRIP or LOCATION
  themeId: string;
  subThemeIds: string[];
  title: string;
  description: string;
  locations: LocationData[];
  imageUrls?: string[];
  rating?: number;
  multiCriteriaRatings?: MultiCriteriaRatings;
}

interface UpdatePostInput {
  description?: string;
  rating?: number;
  imageUrls?: string[];
  multiCriteriaRatings?: MultiCriteriaRatings;
}

export class PostService {
  /**
   * Enrich location data with missing city and country information
   * Uses reverse geocoding if coordinates are available but city/country is missing
   * Preserves location-specific ratings and descriptions during enrichment
   */
  static async enrichLocations(locations: LocationData[]): Promise<LocationData[]> {
    try {
      return await Promise.all(
        locations.map(async (location) => {
          // If city and country are already present, return as-is
          if (location.city && location.country) {
            return location;
          }

          // If we have coordinates but missing city/country, use reverse geocoding
          if (location.latitude && location.longitude) {
            try {
              const result = await geocodingService.reverseGeocode(
                location.latitude,
                location.longitude
              );

              return {
                ...location,
                city: result.city || location.city,
                country: result.country || location.country,
                address: result.address || location.address,
                // Preserve location-specific ratings and description
                rating: location.rating,
                description: location.description,
                multiCriteriaRatings: location.multiCriteriaRatings,
              };
            } catch (error) {
              console.warn(
                `Failed to reverse geocode ${location.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
              );
              // Return original location if reverse geocoding fails
              return location;
            }
          }

          // Return location as-is if no coordinates available
          return location;
        })
      );
    } catch (error) {
      console.error('Error enriching locations:', error);
      // Return original locations if enrichment fails completely
      return locations;
    }
  }

  /**
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
          postType: true,
          themeId: true,
          subThemeIds: true,
          rating: true,
          imageUrls: true,
          locationsData: true,
          multiCriteriaRatings: true,
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
          theme: {
            select: {
              id: true,
              name: true,
              emoji: true,
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
        postType: true,
        themeId: true,
        subThemeIds: true,
        rating: true,
        imageUrls: true,
        locationsData: true,
        multiCriteriaRatings: true,
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
        theme: {
          select: {
            id: true,
            name: true,
            emoji: true,
            subThemes: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        comments: {
          where: { parentCommentId: null },
          select: {
            id: true,
            postId: true,
            userId: true,
            parentCommentId: true,
            content: true,
            isEdited: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: {
                id: true,
                username: true,
                profileImageUrl: true,
              },
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    profileImageUrl: true,
                  },
                },
              },
              orderBy: { createdAt: 'asc' },
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
          postType: true,
          themeId: true,
          subThemeIds: true,
          rating: true,
          imageUrls: true,
          locationsData: true,
          multiCriteriaRatings: true,
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
          theme: {
            select: {
              id: true,
              name: true,
              emoji: true,
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
   * Create a new post with theme system
   */
  static async createPost(data: CreatePostInput) {
    // Initial validation
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data provided to createPost');
    }

    // Validate required fields with strict type checking
    if (!data.userId || typeof data.userId !== 'string') {
      throw new Error('userId is required and must be a string');
    }

    if (!data.postType || typeof data.postType !== 'string') {
      throw new Error('postType is required and must be a string');
    }

    if (!data.themeId || typeof data.themeId !== 'string') {
      throw new Error('themeId is required and must be a string');
    }

    if (!Array.isArray(data.subThemeIds) || data.subThemeIds.length === 0) {
      throw new Error('subThemeIds is required and must be a non-empty array');
    }

    // CRITICAL: Ensure title is a non-empty string - triple check
    if (data.title === null || data.title === undefined) {
      throw new Error('title cannot be null or undefined');
    }

    if (typeof data.title !== 'string') {
      throw new Error(`title must be a string, received ${typeof data.title}`);
    }

    // Validate title
    if (typeof data.title !== 'string' || data.title.trim().length < 1) {
      throw new Error('Title must be at least 1 character long');
    }

    // CRITICAL: Ensure description is a non-empty string - triple check
    if (data.description === null || data.description === undefined) {
      throw new Error('description cannot be null or undefined');
    }

    if (typeof data.description !== 'string') {
      throw new Error(`description must be a string, received ${typeof data.description}`);
    }

    // Validate description
    if (typeof data.description !== 'string' || data.description.trim().length < 10) {
      throw new Error('Description must be at least 10 characters long');
    }

    // Validate postType
    if (!['TRIP', 'LOCATION'].includes(data.postType)) {
      throw new Error('postType must be TRIP or LOCATION');
    }

    // Validate locations based on postType
    if (!Array.isArray(data.locations) || data.locations.length === 0) {
      throw new Error('At least one location is required');
    }

    if (data.postType === 'LOCATION' && data.locations.length !== 1) {
      throw new Error('LOCATION type requires exactly 1 location');
    }

    if (data.postType === 'TRIP' && data.locations.length < 2) {
      throw new Error('TRIP type requires at least 2 locations');
    }

    // Enrich locations with city and country data if missing
    const enrichedLocations = await PostService.enrichLocations(data.locations);

    // Validate locations structure
    for (const loc of enrichedLocations) {
      if (!loc.name || typeof loc.name !== 'string') {
        throw new Error('Each location must have a name');
      }
      if (loc.latitude !== undefined && typeof loc.latitude !== 'number') {
        throw new Error('Location latitude must be a number');
      }
      if (loc.longitude !== undefined && typeof loc.longitude !== 'number') {
        throw new Error('Location longitude must be a number');
      }

      // Validate location-level ratings for TRIP posts
      if (data.postType === 'TRIP') {
        if (loc.rating !== undefined) {
          if (typeof loc.rating !== 'number' || loc.rating < 1 || loc.rating > 5) {
            throw new Error(`Location "${loc.name}": rating must be a number between 1 and 5`);
          }
        }

        if (loc.description !== undefined && loc.description !== null) {
          if (typeof loc.description !== 'string') {
            throw new Error(`Location "${loc.name}": description must be a string`);
          }
          // Description is optional but can be any length if provided
        }

        if (loc.multiCriteriaRatings) {
          const ratings = loc.multiCriteriaRatings;
          if (ratings.optionVariety && (ratings.optionVariety < 1 || ratings.optionVariety > 5)) {
            throw new Error(`Location "${loc.name}": optionVariety rating must be between 1 and 5`);
          }
          if (ratings.location && (ratings.location < 1 || ratings.location > 5)) {
            throw new Error(`Location "${loc.name}": location rating must be between 1 and 5`);
          }
          if (ratings.accessibility && (ratings.accessibility < 1 || ratings.accessibility > 5)) {
            throw new Error(`Location "${loc.name}": accessibility rating must be between 1 and 5`);
          }
          if (ratings.priceValue && (ratings.priceValue < 1 || ratings.priceValue > 5)) {
            throw new Error(`Location "${loc.name}": priceValue rating must be between 1 and 5`);
          }
        }
      }
    }

    // Validate theme
    const theme = await ThemeService.getThemeById(data.themeId);
    if (!theme) {
      throw new Error('Theme not found');
    }

    // Validate sub-themes
    if (!Array.isArray(data.subThemeIds) || data.subThemeIds.length === 0) {
      throw new Error('At least one sub-theme must be selected');
    }

    await ThemeService.validateSubThemes(data.themeId, data.subThemeIds);

    // Validate imageUrls
    if (data.imageUrls && !Array.isArray(data.imageUrls)) {
      throw new Error('imageUrls must be an array');
    }

    const imageUrls = data.imageUrls || [];
    if (imageUrls.length < 1 || imageUrls.length > 20) {
      throw new Error('Must upload between 1 and 20 images');
    }

    if (!imageUrls.every((url) => typeof url === 'string')) {
      throw new Error('All image URLs must be strings');
    }

    // Validate rating if provided
    if (data.rating !== undefined) {
      if (typeof data.rating !== 'number' || data.rating < 1 || data.rating > 5) {
        throw new Error('Rating must be a number between 1 and 5');
      }
    }

    // Validate multi-criteria ratings if provided
    if (data.multiCriteriaRatings) {
      const ratings = data.multiCriteriaRatings;
      if (ratings.optionVariety && (ratings.optionVariety < 1 || ratings.optionVariety > 5)) {
        throw new Error('optionVariety rating must be between 1 and 5');
      }
      if (ratings.location && (ratings.location < 1 || ratings.location > 5)) {
        throw new Error('location rating must be between 1 and 5');
      }
      if (ratings.accessibility && (ratings.accessibility < 1 || ratings.accessibility > 5)) {
        throw new Error('accessibility rating must be between 1 and 5');
      }
      if (ratings.priceValue && (ratings.priceValue < 1 || ratings.priceValue > 5)) {
        throw new Error('priceValue rating must be between 1 and 5');
      }
    }

    // Final defensive preparations - ensure no null values will be passed
    const finalTitle = String(data.title).trim();
    const finalDescription = String(data.description).trim();

    if (!finalTitle || finalTitle.length === 0) {
      throw new Error('Final title validation failed: title is empty');
    }

    if (!finalDescription || finalDescription.length === 0) {
      throw new Error('Final description validation failed: description is empty');
    }

    console.log('Creating post with:');
    console.log('- title:', finalTitle);
    console.log('- title type:', typeof finalTitle);
    console.log('- title length:', finalTitle.length);
    console.log('- title is truthy:', !!finalTitle);
    console.log('- description length:', finalDescription.length);
    console.log('- postType:', data.postType);
    console.log('- imageUrls count:', imageUrls.length);
    console.log('- userId:', data.userId);
    console.log('- themeId:', data.themeId);

    // One final check before Prisma - this should never fail if we got here
    if (!finalTitle || typeof finalTitle !== 'string' || finalTitle.length === 0) {
      throw new Error(`CRITICAL ERROR: Title validation failed before Prisma insert. Title: "${finalTitle}", Type: ${typeof finalTitle}`);
    }

    try {
      return prisma.post.create({
        data: {
          userId: data.userId,
          postType: data.postType,
          themeId: data.themeId,
          subThemeIds: data.subThemeIds,
          title: finalTitle,
          description: finalDescription,
          rating: data.rating,
          imageUrls: imageUrls,
          locationsData: enrichedLocations as unknown as Prisma.InputJsonValue,
          multiCriteriaRatings: data.multiCriteriaRatings
            ? (data.multiCriteriaRatings as unknown as Prisma.InputJsonValue)
            : undefined,
        },
        select: {
          id: true,
          title: true,
          description: true,
          postType: true,
          themeId: true,
          subThemeIds: true,
          rating: true,
          imageUrls: true,
          locationsData: true,
          multiCriteriaRatings: true,
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
          theme: {
            select: {
              id: true,
              name: true,
              emoji: true,
            },
          },
        },
      }).then((post) => ({
        ...post,
        locations: post.locationsData as unknown as LocationData[],
      }));
    } catch (prismaError: any) {
      console.error('Prisma error details:', {
        code: prismaError.code,
        message: prismaError.message,
        meta: prismaError.meta,
        clientVersion: prismaError.clientVersion,
      });
      throw prismaError;
    }
  }

  /**
   * Update post
   */
  static async updatePost(postId: string, data: UpdatePostInput) {
    const updateData: any = {};

    if (data.description !== undefined) {
      if (data.description.trim().length < 10) {
        throw new Error('Description must be at least 10 characters long');
      }
      updateData.description = data.description.trim();
    }

    if (data.rating !== undefined) {
      if (typeof data.rating !== 'number' || data.rating < 1 || data.rating > 5) {
        throw new Error('Rating must be a number between 1 and 5');
      }
      updateData.rating = data.rating;
    }

    if (data.imageUrls !== undefined) {
      if (!Array.isArray(data.imageUrls)) {
        throw new Error('imageUrls must be an array');
      }
      if (data.imageUrls.length < 1 || data.imageUrls.length > 20) {
        throw new Error('Must have between 1 and 20 images');
      }
      updateData.imageUrls = data.imageUrls;
    }

    if (data.multiCriteriaRatings !== undefined) {
      const ratings = data.multiCriteriaRatings;
      if (ratings.optionVariety && (ratings.optionVariety < 1 || ratings.optionVariety > 5)) {
        throw new Error('optionVariety rating must be between 1 and 5');
      }
      if (ratings.location && (ratings.location < 1 || ratings.location > 5)) {
        throw new Error('location rating must be between 1 and 5');
      }
      if (ratings.accessibility && (ratings.accessibility < 1 || ratings.accessibility > 5)) {
        throw new Error('accessibility rating must be between 1 and 5');
      }
      if (ratings.priceValue && (ratings.priceValue < 1 || ratings.priceValue > 5)) {
        throw new Error('priceValue rating must be between 1 and 5');
      }
      updateData.multiCriteriaRatings = ratings;
    }

    return prisma.post.update({
      where: { id: postId },
      data: updateData,
      select: {
        id: true,
        description: true,
        postType: true,
        themeId: true,
        subThemeIds: true,
        rating: true,
        imageUrls: true,
        locationsData: true,
        multiCriteriaRatings: true,
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
        theme: {
          select: {
            id: true,
            name: true,
            emoji: true,
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
  static async addComment(data: {
    postId: string;
    userId: string;
    content: string;
    parentCommentId?: string | null;
  }) {
    return prisma.comment.create({
      data: {
        postId: data.postId,
        userId: data.userId,
        content: data.content,
        parentCommentId: data.parentCommentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImageUrl: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                profileImageUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  /**
   * Get comments for post with post owner ID
   */
  static async getPostComments(postId: string) {
    // First get the post to retrieve post owner ID
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    // Get top-level comments with replies
    const comments = await prisma.comment.findMany({
      where: { postId, parentCommentId: null },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImageUrl: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                profileImageUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      comments,
      postOwnerId: post.userId,
    };
  }

  /**
   * Delete comment (post owner can delete any, users can delete own)
   */
  static async deleteComment(data: {
    postId: string;
    commentId: string;
    userId: string;
  }) {
    // Get the comment
    const comment = await prisma.comment.findUnique({
      where: { id: data.commentId },
      include: {
        post: {
          select: { userId: true },
        },
      },
    });

    if (!comment) {
      console.log('[deleteComment] Comment not found:', data.commentId);
      throw new Error('Comment not found');
    }

    // Check authorization: comment author or post owner
    const isCommentAuthor = comment.userId === data.userId;
    const isPostOwner = comment.post.userId === data.userId;

    console.log('[deleteComment] Permission check', {
      commentUserId: comment.userId,
      userId: data.userId,
      isCommentAuthor,
      isPostOwner,
      allowed: isCommentAuthor || isPostOwner,
    });

    if (!isCommentAuthor && !isPostOwner) {
      return null; // Indicate unauthorized
    }

    // Delete comment (cascade will delete replies)
    await prisma.comment.delete({
      where: { id: data.commentId },
    });

    console.log('[deleteComment] Successfully deleted comment:', data.commentId);
    return true;
  }

  /**
   * Edit comment (users can edit own comments only)
   */
  static async editComment(data: {
    postId: string;
    commentId: string;
    content: string;
    userId: string;
  }) {
    // Get the comment to verify ownership
    const comment = await prisma.comment.findUnique({
      where: { id: data.commentId },
    });

    if (!comment) {
      console.log('[editComment] Comment not found:', data.commentId);
      throw new Error('Comment not found');
    }

    // Check authorization: only comment author can edit
    const isCommentAuthor = comment.userId === data.userId;
    console.log('[editComment] Permission check', {
      commentUserId: comment.userId,
      userId: data.userId,
      isCommentAuthor,
    });

    if (!isCommentAuthor) {
      return null; // Indicate unauthorized
    }

    // Update comment with isEdited flag
    const updated = await prisma.comment.update({
      where: { id: data.commentId },
      data: {
        content: data.content,
        isEdited: true,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImageUrl: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                profileImageUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    console.log('[editComment] Successfully edited comment:', data.commentId);
    return updated;
  }
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
