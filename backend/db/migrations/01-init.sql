-- NerdeTatil Database Schema
-- PostgreSQL 16+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE "public"."PostCategory" AS ENUM ('TRIP', 'FOOD_PLACE', 'HOTEL', 'ATTRACTION');

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    bio TEXT,
    profile_image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posts/Shares table
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category "public"."PostCategory" DEFAULT 'ATTRACTION',
    title VARCHAR(255),
    description TEXT NOT NULL,
    rating SMALLINT CHECK (rating >= 1 AND rating <= 5),
    image_urls TEXT[],
    locations_data JSONB NOT NULL,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    metadata JSONB,
    is_public BOOLEAN DEFAULT true,
    allow_comments BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Likes/Reactions table
CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) DEFAULT 'like', -- 'like', 'love', 'interesting'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id)
);

-- User follows table (for future feature)
CREATE TABLE IF NOT EXISTS user_follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_locations_city ON locations(city);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON user_follows(following_id);

-- Sample data for development (optional)
-- Uncomment to seed database with sample data

-- INSERT INTO users (email, password_hash, username, full_name, bio, profile_image_url)
-- VALUES 
--     ('user1@example.com', 'hashed_password_1', 'explorer1', 'Ahmet Yılmaz', 'Seyahat tutkunuyum', 'https://via.placeholder.com/150'),
--     ('user2@example.com', 'hashed_password_2', 'traveler2', 'Fatih Kaya', 'Doğa severim', 'https://via.placeholder.com/150'),
--     ('user3@example.com', 'hashed_password_3', 'wanderer3', 'Elif Demir', 'Kültür ve yemek turizmi', 'https://via.placeholder.com/150');

-- INSERT INTO locations (name, address, city, country, latitude, longitude, description)
-- VALUES 
--     ('Cappadocia', 'Cappadocia, Nevsehir', 'Nevşehir', 'Turkey', 38.7436, 34.5560, 'Cappadocia meşe ormanları ve fairy chimneys ünlüdür'),
--     ('Galata Tower', 'Galata Tower, Istanbul', 'Istanbul', 'Turkey', 41.0255, 28.9749, '14. yüzyılda inşa edilen tarihi kule'),
--     ('Pamukkale', 'Pamukkale, Denizli', 'Denizli', 'Turkey', 37.9201, 29.1144, 'Beyaz termal travertenleriyle ünlü doğal harika');

-- End of initialization script
