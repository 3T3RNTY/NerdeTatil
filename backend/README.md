# NerdeTatil Backend API

Express.js + PostgreSQL backend for NerdeTatil application.

## Prerequisites

- Node.js >= 18.0.0
- PostgreSQL running on Docker (via docker-compose)
- npm or yarn

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# .env file is already created with default values
# Update if needed:
cat .env
```

**Default Database Configuration:**
- Host: `localhost`
- Port: `5432`
- Database: `nerdetatil_db`
- User: `nerdetatil_user`
- Password: `nerdetatil_password`

### 3. Ensure Database is Running

```bash
# In the project root directory
cd ..
docker-compose ps

# Output should show:
# nerdetatil_postgres ... Up (healthy)
```

If not running:
```bash
docker-compose up -d
```

### 4. Start the Server

```bash
# Production
npm start

# Development (shows SQL queries)
npm run dev
```

Server will start on: `http://localhost:5000`

## API Endpoints

### Health Check
```bash
GET /health
# Returns: { status: 'OK', database: 'connected' }
```

### Users
```bash
# Create user
POST /api/users
Body: {
  "email": "user@example.com",
  "username": "exploreruser",
  "password": "securePassword123",
  "full_name": "Ahmet Yılmaz"
}

# Get user
GET /api/users/:id
```

### Posts
```bash
# List posts
GET /api/posts?page=1&limit=10

# Get post details
GET /api/posts/:id

# Create post
POST /api/posts
Body: {
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "location_id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Amazing experience",
  "description": "Baloon tour in Cappadocia was incredible!",
  "rating": 5,
  "image_urls": ["https://example.com/image1.jpg"]
}

# Add comment
POST /api/posts/:id/comments
Body: {
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "content": "This looks amazing!"
}

# Like post
POST /api/posts/:id/like
Body: {
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "reaction_type": "like"
}

# Unlike post
DELETE /api/posts/:id/like
Body: {
  "user_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Locations
```bash
# List locations
GET /api/locations?city=Istanbul&search=Galata

# Create location
POST /api/locations
Body: {
  "name": "Galata Tower",
  "address": "Galata Tower, Istanbul",
  "city": "Istanbul",
  "country": "Turkey",
  "latitude": 41.0255,
  "longitude": 28.9749,
  "description": "Historic tower from 14th century"
}
```

## Database Schema

### Tables

- **users** - User accounts and profiles
- **locations** - Travel destinations and locations
- **posts** - User shares and travel experiences
- **comments** - Comments on posts
- **likes** - Post reactions and likes
- **user_follows** - User follow relationships

### Key Relationships

```
users (1) ──→ (N) posts
locations (1) ──→ (N) posts
posts (1) ──→ (N) comments
posts (1) ──→ (N) likes
users (1) ──→ (N) comments
users (1) ──→ (N) likes
```

## Connecting from Frontend

### React Native / Expo

```javascript
// api.js
export const API_BASE_URL = 'http://localhost:5000';

export const fetchPosts = async () => {
  const response = await fetch(`${API_BASE_URL}/api/posts`);
  return response.json();
};

export const createPost = async (postData) => {
  const response = await fetch(`${API_BASE_URL}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData)
  });
  return response.json();
};
```

### Environment Configuration

In your React Native `.env` or config file:

```env
# For Android emulator
REACT_APP_API_BASE_URL=http://10.0.2.2:5000

# For iOS simulator
REACT_APP_API_BASE_URL=http://localhost:5000

# For web
REACT_APP_API_BASE_URL=http://localhost:5000

# For physical device (replace with your machine IP)
REACT_APP_API_BASE_URL=http://192.168.1.100:5000
```

## Database Queries

### View All Tables

```bash
docker-compose exec postgres psql -U nerdetatil_user -d nerdetatil_db -c "\dt"
```

### Connect to Database

```bash
# Using psql
psql -h localhost -U nerdetatil_user -d nerdetatil_db

# Using DBeaver or pgAdmin
# Host: localhost:5432
# User: nerdetatil_user
# Password: nerdetatil_password
```

## Troubleshooting

### "Cannot connect to database"
```bash
# Check if Docker container is running
docker-compose ps

# View logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### "Port 5000 already in use"
```bash
# Change PORT in .env
PORT=5001
```

### "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

- [ ] Implement JWT authentication
- [ ] Add input validation (joi/express-validator)
- [ ] Implement password hashing (bcryptjs)
- [ ] Add rate limiting
- [ ] Add request logging middleware
- [ ] Write unit tests
- [ ] Deploy to production server
- [ ] Setup environment-specific configurations

## File Structure

```
backend/
├── server.js              # Main entry point
├── package.json           # Dependencies
├── .env                   # Environment variables
├── .gitignore             # Git ignore rules
├── src/
│   ├── db/
│   │   └── connection.js  # Database connection pool
│   ├── routes/
│   │   └── api.js         # API endpoints
│   └── middleware/        # Express middleware (for future auth)
└── README.md              # This file
```

## License

MIT
