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
}

export interface AuthResponse {
  user: User;
  token: string;
}

export class UserService {
  /**
   * Register a new user
   */
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
      console.error('Registration error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
      });
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
      throw { error: errorMessage };
    }
  }

  /**
   * Login user
   */
  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', {
        email,
        password,
      });
      return response.data;
    } catch (error: any) {
      console.error('Login error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
      });
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      throw { error: errorMessage };
    }
  }

  /**
   * Verify token
   */
  static async verifyToken(token: string): Promise<{ valid: boolean; userId: string; email: string }> {
    try {
      const response = await apiClient.post('/auth/verify', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      console.error('Token verification error:', {
        status: error.response?.status,
        message: error.message,
      });
      return { valid: false, userId: '', email: '' };
    }
  }

  /**
   * Get user by ID
   */
  static async getUser(userId: string): Promise<User> {
    try {
      const response = await apiClient.get<User>(`/users/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Get user error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error.response?.data || { error: 'Failed to fetch user' };
    }
  }

  /**
   * Get user profile with stats
   */
  static async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const response = await apiClient.get<UserProfile>(
        `/users/${userId}/profile`
      );
      return response.data;
    } catch (error: any) {
      console.error('Get user profile error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error.response?.data || { error: 'Failed to fetch user profile' };
    }
  }

  /**
   * Update user profile
   */
  static async updateUser(userId: string, data: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.put<User>(`/users/${userId}`, data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to update user' };
    }
  }
}
