import { Request, Response } from 'express';
import { PostService } from '../services/postService';

export class PostController {
  /**
   * GET /api/posts
   * Get all posts with pagination
   */
  static async list(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await PostService.getPosts(page, limit);

      res.json(result);
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/posts/:id
   * Get post by ID with comments
   */
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const post = await PostService.getPostById(id);

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      res.json(post);
    } catch (error) {
      console.error('Error fetching post:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /api/posts
   * Create a new post with multiple locations and category
   */
  static async create(req: Request, res: Response) {
    try {
      const { userId, category, title, description, rating, imageUrls, locations, startDate, endDate, metadata } =
        req.body;

      if (!userId || !category || !description || !locations || locations.length === 0) {
        return res.status(400).json({
          error:
            'Missing required fields: userId, category, description, locations',
        });
      }

      const post = await PostService.createPost({
        userId,
        category,
        title,
        description,
        rating,
        imageUrls,
        locations,
        startDate,
        endDate,
        metadata,
      });

      res.status(201).json(post);
    } catch (error: any) {
      console.error('Error creating post:', error);
      if (error.message.includes('Missing required fields')) {
        return res.status(400).json({ error: error.message });
      }
      if (error.code === 'P2025') {
        return res
          .status(400)
          .json({ error: 'User not found' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * PUT /api/posts/:id
   * Update post
   */
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, description, rating, imageUrls } = req.body;

      const post = await PostService.updatePost(id, {
        title,
        description,
        rating,
        imageUrls,
      });

      res.json(post);
    } catch (error: any) {
      console.error('Error updating post:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * DELETE /api/posts/:id
   * Delete post
   */
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await PostService.deletePost(id);

      res.json({ message: 'Post deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting post:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /api/posts/:id/comments
   * Add comment to post
   */
  static async addComment(req: Request, res: Response) {
    try {
      const { id: postId } = req.params;
      const { userId, content } = req.body;

      if (!userId || !content) {
        return res.status(400).json({
          error: 'Missing required fields: userId, content',
        });
      }

      const comment = await PostService.addComment({
        postId,
        userId,
        content,
      });

      res.status(201).json(comment);
    } catch (error: any) {
      console.error('Error creating comment:', error);
      if (error.code === 'P2025') {
        return res.status(400).json({ error: 'Post or user not found' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/posts/:id/comments
   * Get comments for post
   */
  static async getComments(req: Request, res: Response) {
    try {
      const { id: postId } = req.params;

      const comments = await PostService.getPostComments(postId);

      res.json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /api/posts/:id/like
   * Like a post
   */
  static async like(req: Request, res: Response) {
    try {
      const { id: postId } = req.params;
      const { userId, reactionType } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'userId required' });
      }

      const like = await PostService.likePost(
        postId,
        userId,
        reactionType || 'like'
      );

      res.status(201).json(like);
    } catch (error: any) {
      console.error('Error liking post:', error);
      if (error.code === 'P2025') {
        return res.status(400).json({ error: 'Post or user not found' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * DELETE /api/posts/:id/like
   * Unlike a post
   */
  static async unlike(req: Request, res: Response) {
    try {
      const { id: postId } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'userId required' });
      }

      await PostService.unlikePost(postId, userId);

      res.json({ message: 'Like removed' });
    } catch (error) {
      console.error('Error removing like:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/posts/user/:userId
   * Get posts by user
   */
  static async getByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await PostService.getPostsByUserId(userId, page, limit);

      res.json(result);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
