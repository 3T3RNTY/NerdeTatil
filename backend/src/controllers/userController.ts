import { Request, Response } from 'express';
import { UserService } from '../services/userService';

export class UserController {
  /**
   * POST /api/users
   * Create a new user
   */
  static async create(req: Request, res: Response) {
    try {
      const { email, username, password, fullName } = req.body;

      if (!email || !username || !password) {
        return res.status(400).json({
          error: 'Missing required fields: email, username, password',
        });
      }

      // Check if user already exists
      const existingUser = await UserService.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      const user = await UserService.createUser({
        email,
        username,
        password,
        fullName,
      });

      res.status(201).json(user);
    } catch (error: any) {
      console.error('Error creating user:', error);
      if (error.code === 'P2002') {
        return res.status(400).json({
          error: `${error.meta.target[0]} already exists`,
        });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/users/:id
   * Get user by ID
   */
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await UserService.getUserById(id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/users/:id/profile
   * Get user profile with stats
   */
  static async getProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const profile = await UserService.getUserProfile(id);

      if (!profile) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * PUT /api/users/:id
   * Update user profile
   */
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { bio, fullName, profileImageUrl } = req.body;

      const user = await UserService.updateUser(id, {
        bio,
        fullName,
        profileImageUrl,
      });

      res.json(user);
    } catch (error: any) {
      console.error('Error updating user:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
