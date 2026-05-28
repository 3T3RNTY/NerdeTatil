import { Request, Response } from 'express';
import { PostService } from '../services/postService';
import { ThemeService } from '../services/themeService';

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
   * GET /api/themes
   * Get all themes with sub-themes
   */
  static async getThemes(req: Request, res: Response) {
    try {
      const themes = await ThemeService.getAllThemes();
      res.json(themes);
    } catch (error) {
      console.error('Error fetching themes:', error);
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
   * Create a new post with theme system
   */
  static async create(req: Request, res: Response) {
    try {
      console.log('Post creation request received:');
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      
      const {
        userId,
        postType,
        themeId,
        subThemeIds,
        title,
        description,
        locations,
        imageUrls,
        rating,
        multiCriteriaRatings,
      } = req.body;

      console.log('Extracted fields:');
      console.log('- userId:', userId);
      console.log('- title:', title, '(type:', typeof title, ')');
      console.log('- description:', description);
      console.log('- postType:', postType);

      // Defensive null/undefined checks
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({
          error: 'userId is required and must be a string',
        });
      }

      if (!postType || typeof postType !== 'string') {
        return res.status(400).json({
          error: 'postType is required and must be a string',
        });
      }

      if (!themeId || typeof themeId !== 'string') {
        return res.status(400).json({
          error: 'themeId is required and must be a string',
        });
      }

      if (!subThemeIds || !Array.isArray(subThemeIds) || subThemeIds.length === 0) {
        return res.status(400).json({
          error: 'subThemeIds is required and must be a non-empty array',
        });
      }

      // CRITICAL: Ensure title is a non-empty string
      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({
          error: 'title is required and must be a non-empty string',
        });
      }

      if (!description || typeof description !== 'string' || description.trim().length === 0) {
        return res.status(400).json({
          error: 'description is required and must be a non-empty string',
        });
      }

      if (!locations || !Array.isArray(locations) || locations.length === 0) {
        return res.status(400).json({
          error: 'locations is required and must be a non-empty array',
        });
      }

      // Ensure title and description are not null
      const sanitizedTitle = String(title).trim();
      const sanitizedDescription = String(description).trim();

      if (!sanitizedTitle) {
        return res.status(400).json({
          error: 'title cannot be empty after trimming',
        });
      }

      if (!sanitizedDescription) {
        return res.status(400).json({
          error: 'description cannot be empty after trimming',
        });
      }

      const post = await PostService.createPost({
        userId,
        postType: postType as any,
        themeId,
        subThemeIds,
        title: sanitizedTitle,
        description: sanitizedDescription,
        locations,
        imageUrls,
        rating,
        multiCriteriaRatings,
      });

      res.status(201).json(post);
    } catch (error: any) {
      console.error('Error creating post:', error);
      if (error.message.includes('Missing required fields')) {
        return res.status(400).json({ error: error.message });
      }
      if (error.code === 'P2025') {
        return res.status(400).json({ error: 'User or theme not found' });
      }
      // Return detailed Prisma error for debugging
      if (error.code && error.code.startsWith('P')) {
        return res.status(400).json({
          error: `Database error: ${error.message}`,
          code: error.code,
        });
      }
      res.status(400).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * PUT /api/posts/:id
   * Update post
   */
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { description, rating, imageUrls, multiCriteriaRatings } = req.body;

      const post = await PostService.updatePost(id, {
        description,
        rating,
        imageUrls,
        multiCriteriaRatings,
      });

      res.json(post);
    } catch (error: any) {
      console.error('Error updating post:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.status(400).json({ error: error.message || 'Internal server error' });
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
      const { userId, content, parentCommentId } = req.body;

      if (!userId || !content) {
        return res.status(400).json({
          error: 'Missing required fields: userId, content',
        });
      }

      const comment = await PostService.addComment({
        postId,
        userId,
        content,
        parentCommentId: parentCommentId || null,
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

      const data = await PostService.getPostComments(postId);

      res.json(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * DELETE /api/posts/:id/comments/:commentId
   * Delete comment (post owner can delete any, users can delete own)
   */
  static async deleteComment(req: Request, res: Response) {
    try {
      const { id: postId, commentId } = req.params;
      const authUser = (req as any).user;

      console.log('[deleteComment] Attempting to delete', {
        postId,
        commentId,
        userId: authUser?.userId,
        isAuth: !!authUser,
      });

      if (!authUser) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await PostService.deleteComment({
        postId,
        commentId,
        userId: authUser.userId,
      });

      console.log('[deleteComment] Delete result:', result);

      if (!result) {
        return res.status(403).json({ 
          error: 'You can only delete your own comments or comments on your posts' 
        });
      }

      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Comment or post not found' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * PATCH /api/posts/:id/comments/:commentId
   * Edit comment (users can edit own comments only)
   */
  static async editComment(req: Request, res: Response) {
    try {
      const { id: postId, commentId } = req.params;
      const { content } = req.body;
      const authUser = (req as any).user;

      console.log('[editComment] Attempting to edit', {
        postId,
        commentId,
        userId: authUser?.userId,
        contentLength: content?.length,
      });

      if (!authUser) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!content || !content.trim()) {
        return res.status(400).json({ error: 'Content cannot be empty' });
      }

      const comment = await PostService.editComment({
        postId,
        commentId,
        content: content.trim(),
        userId: authUser.userId,
      });

      console.log('[editComment] Edit result:', !!comment);

      if (!comment) {
        return res.status(403).json({ 
          error: 'You can only edit your own comments' 
        });
      }

      res.json(comment);
    } catch (error: any) {
      console.error('Error editing comment:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Comment or post not found' });
      }
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
