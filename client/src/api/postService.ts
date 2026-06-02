import apiClient from './client';

export type PostType = 'TRIP' | 'LOCATION';

export interface SubTheme {
  id: string;
  name: string;
}

export interface Theme {
  id: string;
  name: string;
  emoji: string;
  description: string;
  subThemes: SubTheme[];
}

export interface MultiCriteriaRatings {
  optionVariety?: number; // 1-5
  location?: number; // 1-5
  accessibility?: number; // 1-5
  priceValue?: number; // 1-5
}

export interface LocationData {
  id?: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  visitDate?: string | null;
  // Location-specific ratings (for TRIP posts only)
  rating?: number; // 1-5 overall rating for this location
  description?: string; // User's review/description for this location
  multiCriteriaRatings?: MultiCriteriaRatings; // Per-location multi-criteria ratings
}

export interface Location {
  id: string;
  name: string;
  city?: string;
  country?: string;
}

export interface PostUser {
  id: string;
  username: string;
  profileImageUrl?: string;
}

export interface Post {
  id: string;
  title: string;
  description: string;
  postType: PostType;
  themeId: string;
  subThemeIds: string[];
  rating?: number;
  imageUrls: string[];
  locations: LocationData[];
  multiCriteriaRatings?: MultiCriteriaRatings;
  isPublic: boolean;
  allowComments: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: PostUser;
  theme: {
    id: string;
    name: string;
    emoji: string;
    subThemes?: SubTheme[];
  };
  likesCount: number;
  commentsCount: number;
  isLikedByCurrentUser?: boolean;
  // Optional extended fields used in some UI components
  category?: string;
  startDate?: string;
  endDate?: string;
  metadata?: any;
}

export interface PostDetail extends Post {
  comments: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  user: PostUser;
  replies?: Comment[];
}

export interface PostsResponse {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SearchSummaryResponse {
  summary: string;
  cached: boolean;
  generatedAt: string;
  metrics?: {
    visitCount: number;
    happinessPercentage: number;
    postTypes: Record<string, number>;
    topThemes: Array<{ name: string; count: number }>;
    avgEngagement: number;
  };
}

export class PostService {
  /**
   * Get all themes with sub-themes
   */
  static async getThemes(): Promise<Theme[]> {
    try {
      const response = await apiClient.get<Theme[]>('/themes');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to fetch themes' };
    }
  }

  /**
   * Get all posts with pagination
   */
  static async getPosts(page: number = 1, limit: number = 10): Promise<PostsResponse> {
    try {
      const response = await apiClient.get<PostsResponse>('/posts', {
        params: { page, limit },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to fetch posts' };
    }
  }

  /**
   * Get single post by ID
   */
  static async getPostById(postId: string): Promise<PostDetail> {
    try {
      const response = await apiClient.get<PostDetail>(`/posts/${postId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to fetch post' };
    }
  }

  /**
   * Get posts by user
   */
  static async getPostsByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PostsResponse> {
    try {
      const response = await apiClient.get<PostsResponse>(
        `/posts/user/${userId}`,
        { params: { page, limit } }
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to fetch user posts' };
    }
  }

  /**
   * Posts the user has commented on
   */
  static async getPostsCommentedByUser(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PostsResponse> {
    try {
      const response = await apiClient.get<PostsResponse>(
        `/posts/user/${userId}/commented`,
        { params: { page, limit } }
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to fetch commented posts' };
    }
  }

  /**
   * Search posts by query, city, country, and theme
   */
  static async searchPosts(
    query: string = '',
    filters?: {
      city?: string;
      country?: string;
      themeId?: string;
    },
    page: number = 1,
    limit: number = 10
  ): Promise<PostsResponse> {
    try {
      const params: any = { page, limit };
      if (query) params.q = query;
      if (filters?.city) params.city = filters.city;
      if (filters?.country) params.country = filters.country;
      if (filters?.themeId) params.themeId = filters.themeId;

      const response = await apiClient.get<PostsResponse>('/posts/search', {
        params,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to search posts' };
    }
  }

  /**
   * Get AI summary for search results
   */
  static async searchSummary(
    query: string = '',
    filters?: {
      city?: string;
      country?: string;
      themeId?: string;
    }
  ): Promise<SearchSummaryResponse> {
    try {
      const params: any = {};
      if (query) params.q = query;
      if (filters?.city) params.city = filters.city;
      if (filters?.country) params.country = filters.country;
      if (filters?.themeId) params.themeId = filters.themeId;

      const response = await apiClient.get<SearchSummaryResponse>('/posts/search/summary', {
        params,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to fetch summary' };
    }
  }

  /**
   * Create a new post with theme system
   */
  static async createPost(data: {
    userId: string;
    postType: PostType;
    themeId: string;
    subThemeIds: string[];
    title: string;
    description: string;
    rating?: number;
    imageUrls?: string[];
    locations: LocationData[];
    multiCriteriaRatings?: MultiCriteriaRatings;
  }): Promise<Post> {
    try {
      const response = await apiClient.post<Post>('/posts', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to create post' };
    }
  }

  /**
   * Update post
   */
  static async updatePost(
    postId: string,
    data: Partial<Post>
  ): Promise<Post> {
    try {
      const response = await apiClient.put<Post>(`/posts/${postId}`, data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to update post' };
    }
  }

  /**
   * Delete post
   */
  static async deletePost(postId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(
        `/posts/${postId}`
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to delete post' };
    }
  }

  /**
   * Add comment to post (or reply to a comment)
   */
  static async addComment(
    postId: string,
    data: { userId: string; content: string; parentCommentId?: string }
  ): Promise<Comment> {
    try {
      const response = await apiClient.post<Comment>(
        `/posts/${postId}/comments`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to add comment' };
    }
  }

  /**
   * Delete comment
   */
  static async deleteComment(postId: string, commentId: string): Promise<void> {
    try {
      await apiClient.delete(`/posts/${postId}/comments/${commentId}`);
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to delete comment' };
    }
  }

  /**
   * Edit comment
   */
  static async editComment(
    postId: string,
    commentId: string,
    content: string
  ): Promise<Comment> {
    try {
      const response = await apiClient.patch<Comment>(
        `/posts/${postId}/comments/${commentId}`,
        { content }
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to edit comment' };
    }
  }

  /**
   * Get comments for post
   */
  static async getComments(postId: string): Promise<Comment[]> {
    try {
      const response = await apiClient.get<Comment[]>(
        `/posts/${postId}/comments`
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to fetch comments' };
    }
  }

  /**
   * Like a post
   */
  static async likePost(postId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post(`/posts/${postId}/like`, {
        reactionType: 'like',
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to like post' };
    }
  }

  /**
   * Unlike a post
   */
  static async unlikePost(postId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete(`/posts/${postId}/like`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to unlike post' };
    }
  }

  /**
   * Posts liked by the authenticated user only
   */
  static async getPostsLikedByUser(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PostsResponse> {
    try {
      const response = await apiClient.get<PostsResponse>(
        `/posts/user/${userId}/liked`,
        { params: { page, limit } }
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to fetch liked posts' };
    }
  }
}
