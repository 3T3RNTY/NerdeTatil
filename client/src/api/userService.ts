import apiClient from './client';

export interface User {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  bio?: string;
  profileImageUrl?: string;
  createdAt?: string;
}

export interface UserProfile extends User {
  postsCount: number;
  commentsCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
  isOwnProfile?: boolean;
}

export interface UserSummary {
  id: string;
  username: string;
  fullName?: string;
  bio?: string;
  profileImageUrl?: string;
  isFollowing?: boolean;
  followedAt?: string;
}

export interface UsersListResponse {
  users: UserSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}

export class UserService {
  static async register(data: {
    email: string;
    username: string;
    password: string;
    fullName?: string;
  }): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        '/auth/register',
        data
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
      throw { error: errorMessage };
    }
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', {
        email,
        password,
      });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      throw { error: errorMessage };
    }
  }

  static async verifyToken(token: string): Promise<{ valid: boolean; userId: string; email: string }> {
    try {
      const response = await apiClient.post('/auth/verify', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch {
      return { valid: false, userId: '', email: '' };
    }
  }

  static async getUser(userId: string): Promise<User> {
    try {
      const response = await apiClient.get<User>(`/users/${userId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to fetch user' };
    }
  }

  static async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const response = await apiClient.get<UserProfile>(
        `/users/${userId}/profile`
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to fetch user profile' };
    }
  }

  static async updateUser(userId: string, data: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.put<User>(`/users/${userId}`, data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to update user' };
    }
  }

  static async followUser(userId: string): Promise<{ following: boolean }> {
    try {
      const response = await apiClient.post<{ following: boolean }>(
        `/users/${userId}/follow`
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to follow user' };
    }
  }

  static async unfollowUser(userId: string): Promise<{ following: boolean }> {
    try {
      const response = await apiClient.delete<{ following: boolean }>(
        `/users/${userId}/follow`
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to unfollow user' };
    }
  }

  static async getFollowers(
    userId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<UsersListResponse> {
    try {
      const response = await apiClient.get<UsersListResponse>(
        `/users/${userId}/followers`,
        { params: { page, limit } }
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to fetch followers' };
    }
  }

  static async getFollowing(
    userId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<UsersListResponse> {
    try {
      const response = await apiClient.get<UsersListResponse>(
        `/users/${userId}/following`,
        { params: { page, limit } }
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to fetch following' };
    }
  }
}
