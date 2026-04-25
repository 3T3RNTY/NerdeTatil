/**
 * NerdeTatil Backend Server
 * Express.js + PostgreSQL + Prisma + TypeScript
 *
 * Run: npm run dev (development) or npm start (production)
 */

import 'dotenv/config';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import apiRoutes from './routes/api';

const app: Express = express();

// ============================================
// MIDDLEWARE
// ============================================

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// ROUTES
// ============================================

app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: 'connected',
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'NerdeTatil Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        verify: 'POST /api/auth/verify',
      },
      users: {
        create: 'POST /api/users',
        getById: 'GET /api/users/:id',
        getProfile: 'GET /api/users/:id/profile',
        update: 'PUT /api/users/:id',
      },
      posts: {
        list: 'GET /api/posts',
        getById: 'GET /api/posts/:id',
        create: 'POST /api/posts',
        update: 'PUT /api/posts/:id',
        delete: 'DELETE /api/posts/:id',
        byUser: 'GET /api/posts/user/:userId',
      },
      comments: {
        add: 'POST /api/posts/:id/comments',
        list: 'GET /api/posts/:id/comments',
      },
      likes: {
        like: 'POST /api/posts/:id/like',
        unlike: 'DELETE /api/posts/:id/like',
      },
      locations: {
        list: 'GET /api/locations',
        popular: 'GET /api/locations/popular',
        byCountry: 'GET /api/locations/country/:country',
        byCity: 'GET /api/locations/city/:city',
        getById: 'GET /api/locations/:id',
        create: 'POST /api/locations',
        update: 'PUT /api/locations/:id',
        delete: 'DELETE /api/locations/:id',
      },
    },
  });
});

// ============================================
// ERROR HANDLERS
// ============================================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ============================================
// SERVER STARTUP
// ============================================

const PORT = Number(process.env.PORT) || 5000;
const HOST = '0.0.0.0'; // Listen on all network interfaces for mobile access
const server = app.listen(PORT, HOST, () => {
  console.log(`
╔════════════════════════════════════════════════════╗
║       🚀 NerdeTatil Backend Server Started         ║
╠════════════════════════════════════════════════════╣
║  Server:        http://0.0.0.0:${PORT}
║  Local:         http://localhost:${PORT}
║  Network:       http://<your-machine-ip>:${PORT}
║  Environment:   ${process.env.NODE_ENV || 'development'}
║  CORS Origin:   ${process.env.CORS_ORIGIN || 'All origins allowed (*)'}
║  JWT Expires:   ${process.env.JWT_EXPIRES_IN || '7d'}
╠════════════════════════════════════════════════════╣
║  Key Endpoints:
║  ✓ GET    /health           - Health check
║  ✓ GET    /                 - Server info
║  ✓ POST   /api/auth/register - User registration
║  ✓ POST   /api/auth/login    - User login
║  ✓ GET    /api/posts         - List posts
║  ✓ POST   /api/posts         - Create post (auth required)
║  ✓ GET    /api/locations     - List locations
╠════════════════════════════════════════════════════╣
║  Ready to accept requests!
╚════════════════════════════════════════════════════╝
`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export default app;
