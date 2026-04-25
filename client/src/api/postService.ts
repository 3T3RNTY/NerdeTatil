import apiClient from './client';

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
  title?: string;
  description: string;
  rating?: number;
  imageUrls: string[];
  isPublic: boolean;
  allowComments: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  locationId: string;
  user: PostUser;
  location: Location;
  likesCount: number;
  commentsCount: number;
}

export interface PostDetail extends Post {
  comments: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: PostUser;
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

export class PostService {
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
   * Create a new post
   */
  static async createPost(data: {
    userId: string;
    locationId: string;
    title?: string;
    description: string;
    rating?: number;
    imageUrls?: string[];
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
   * Add comment to post
   */
  static async addComment(
    postId: string,
    data: { userId: string; content: string }
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
  static async likePost(postId: string, userId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post(`/posts/${postId}/like`, {
        userId,
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
  static async unlikePost(postId: string, userId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete(`/posts/${postId}/like`, {
        data: { userId },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to unlike post' };
    }
  }
}
