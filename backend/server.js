/**
 * NerdeTatil Backend Server
 * Express.js + PostgreSQL + Prisma
 * 
 * Run: npm run dev (recommended) or npm start (requires build)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./dist/routes/api').default;

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: 'connected',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'NerdeTatil Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      users: '/api/users',
      posts: '/api/posts',
      locations: '/api/locations'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════╗
║       🚀 NerdeTatil Backend Server Started          ║
╠════════════════════════════════════════════════════╣
║  Server:        http://localhost:${PORT}
║  Environment:   ${process.env.NODE_ENV || 'development'}
║  Database:      ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}
║  Database User: ${process.env.DB_USER}
║  CORS Origin:   ${process.env.CORS_ORIGIN || 'All origins allowed (*)'}
╠════════════════════════════════════════════════════╣
║  API Endpoints:
║  GET    /              - Server info
║  GET    /health        - Health check
║  GET    /api           - API info
║  POST   /api/users     - Create user
║  GET    /api/users/:id - Get user
║  GET    /api/posts     - List posts
║  POST   /api/posts     - Create post
║  GET    /api/locations - List locations
║  POST   /api/locations - Create location
╚════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n📴 Shutting down gracefully...');
  server.close(async () => {
    await db.end();
    console.log('Database connection closed');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('\n📴 Server terminating...');
  server.close(async () => {
    await db.end();
    process.exit(0);
  });
});
