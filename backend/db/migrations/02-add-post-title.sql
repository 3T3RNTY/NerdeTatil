-- Add title column to posts table
ALTER TABLE posts ADD COLUMN title VARCHAR(255) NOT NULL DEFAULT '';

-- If you need to populate existing posts with a default title based on description, you can do:
-- UPDATE posts SET title = SUBSTRING(description, 1, 50) WHERE title = '';
