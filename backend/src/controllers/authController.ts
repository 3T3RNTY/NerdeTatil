import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { JwtUtil } from '../utils/jwt';

export class AuthController {
  /**
   * POST /api/auth/register
   * Register a new user
   */
  static async register(req: Request, res: Response) {
    try {
      const { email, username, password, fullName } = req.body;

      const user = await UserService.createUser({
        email,
        username,
        password,
        fullName,
      });

      const token = JwtUtil.sign({
        userId: user.id,
        email: user.email,
      });

      res.status(201).json({
        user,
        token,
      });
    } catch (error: any) {
      console.error('Error registering user:', error);
      if (error.code === 'P2002') {
        return res.status(400).json({
          error: `${error.meta.target[0]} already exists`,
        });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /api/auth/login
   * Login user
   */
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: 'Email and password are required' });
      }

      const user = await UserService.getUserByEmail(email);

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const isPasswordValid = await UserService.verifyPassword(
        password,
        user.passwordHash
      );

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = JwtUtil.sign({
        userId: user.id,
        email: user.email,
      });

      // Return user data without password
      const userResponse = {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
      };

      res.json({
        user: userResponse,
        token,
      });
    } catch (error) {
      console.error('Error logging in user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /api/auth/verify
   * Verify token validity
   */
  static async verify(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const payload = JwtUtil.verify(authHeader.replace('Bearer ', ''));

      if (!payload) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      res.json({
        valid: true,
        userId: payload.userId,
        email: payload.email,
      });
    } catch (error) {
      console.error('Error verifying token:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  }
}
