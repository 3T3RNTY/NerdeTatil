/**
 * API Routes
 * All database-related endpoints for NerdeTatil
 */

const express = require('express');
const db = require('../db/connection');

const router = express.Router();

// ============================================
// HEALTH CHECK
// ============================================

router.get('/', (req, res) => {
  res.json({ message: 'NerdeTatil API v1.0' });
});

// ============================================
// USERS ENDPOINTS
// ============================================

/**
 * GET /api/users/:id
 * Get user by ID
 */
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT id, email, username, full_name, bio, profile_image_url, created_at FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/users
 * Create new user
 * Body: { email, username, password, full_name }
 */
router.post('/users', async (req, res) => {
  try {
    const { email, username, password, full_name } = req.body;
    
    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Missing required fields: email, username, password' });
    }
    
    // TODO: Hash password with bcryptjs
    // const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await db.query(
      'INSERT INTO users (email, username, password_hash, full_name) VALUES ($1, $2, $3, $4) RETURNING id, email, username, full_name',
      [email, username, password, full_name]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Email or username already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// ============================================
// POSTS ENDPOINTS
// ============================================

/**
 * GET /api/posts
 * Get all posts with pagination
 * Query params: page=1, limit=10
 */
router.get('/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const result = await db.query(
      `SELECT 
        p.id, p.title, p.description, p.rating, p.image_urls,
        p.created_at, p.updated_at,
        u.id as user_id, u.username, u.profile_image_url,
        l.id as location_id, l.name as location_name, l.city,
        COUNT(DISTINCT lk.id) as likes_count,
        COUNT(DISTINCT c.id) as comments_count
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN locations l ON p.location_id = l.id
      LEFT JOIN likes lk ON p.id = lk.post_id
      LEFT JOIN comments c ON p.id = c.post_id
      WHERE p.is_public = true
      GROUP BY p.id, u.id, l.id
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    const countResult = await db.query('SELECT COUNT(*) FROM posts WHERE is_public = true');
    const total = parseInt(countResult.rows[0].count);
    
    res.json({
      posts: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/posts/:id
 * Get post by ID with comments
 */
router.get('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const postResult = await db.query(
      `SELECT 
        p.*, u.username, u.profile_image_url,
        l.name as location_name, l.city
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN locations l ON p.location_id = l.id
      WHERE p.id = $1`,
      [id]
    );
    
    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const commentsResult = await db.query(
      `SELECT c.id, c.content, c.created_at,
        u.id as user_id, u.username, u.profile_image_url
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.post_id = $1
      ORDER BY c.created_at DESC`,
      [id]
    );
    
    const post = postResult.rows[0];
    post.comments = commentsResult.rows;
    
    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/posts
 * Create new post
 * Body: { user_id, location_id, title, description, rating, image_urls }
 */
router.post('/posts', async (req, res) => {
  try {
    const { user_id, location_id, title, description, rating, image_urls } = req.body;
    
    if (!user_id || !location_id || !description) {
      return res.status(400).json({ error: 'Missing required fields: user_id, location_id, description' });
    }
    
    const result = await db.query(
      `INSERT INTO posts (user_id, location_id, title, description, rating, image_urls)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [user_id, location_id, title, description, rating, image_urls]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// COMMENTS ENDPOINTS
// ============================================

/**
 * POST /api/posts/:id/comments
 * Add comment to post
 */
router.post('/posts/:id/comments', async (req, res) => {
  try {
    const { id: post_id } = req.params;
    const { user_id, content } = req.body;
    
    if (!user_id || !content) {
      return res.status(400).json({ error: 'Missing required fields: user_id, content' });
    }
    
    const result = await db.query(
      'INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
      [post_id, user_id, content]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// LIKES ENDPOINTS
// ============================================

/**
 * POST /api/posts/:id/like
 * Like a post
 */
router.post('/posts/:id/like', async (req, res) => {
  try {
    const { id: post_id } = req.params;
    const { user_id, reaction_type } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id required' });
    }
    
    const result = await db.query(
      `INSERT INTO likes (post_id, user_id, reaction_type)
      VALUES ($1, $2, $3)
      ON CONFLICT (post_id, user_id) DO UPDATE SET reaction_type = $3
      RETURNING *`,
      [post_id, user_id, reaction_type || 'like']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/posts/:id/like
 * Unlike a post
 */
router.delete('/posts/:id/like', async (req, res) => {
  try {
    const { id: post_id } = req.params;
    const { user_id } = req.body;
    
    await db.query(
      'DELETE FROM likes WHERE post_id = $1 AND user_id = $2',
      [post_id, user_id]
    );
    
    res.json({ message: 'Like removed' });
  } catch (error) {
    console.error('Error removing like:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// LOCATIONS ENDPOINTS
// ============================================

/**
 * GET /api/locations
 * Get all locations
 */
router.get('/locations', async (req, res) => {
  try {
    const { city, country, search } = req.query;
    let query = 'SELECT * FROM locations WHERE 1=1';
    const params = [];
    
    if (city) {
      query += ` AND city = $${params.length + 1}`;
      params.push(city);
    }
    
    if (country) {
      query += ` AND country = $${params.length + 1}`;
      params.push(country);
    }
    
    if (search) {
      query += ` AND (name ILIKE $${params.length + 1} OR address ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/locations
 * Create new location
 */
router.post('/locations', async (req, res) => {
  try {
    const { name, address, city, country, latitude, longitude, description } = req.body;
    
    if (!name || !city) {
      return res.status(400).json({ error: 'name and city are required' });
    }
    
    const result = await db.query(
      `INSERT INTO locations (name, address, city, country, latitude, longitude, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [name, address, city, country, latitude, longitude, description]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
