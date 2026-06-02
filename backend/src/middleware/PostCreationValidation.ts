import { Request, Response, NextFunction } from 'express';

/**
 * Validate post creation data
 */
export const validatePostCreation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, description, rating } = req.body;

  const errors: string[] = [];

  // Strict null/undefined checks
  if (title === null || title === undefined) {
    errors.push('Post title is required (cannot be null or undefined)');
  } else if (typeof title !== 'string') {
    errors.push(`Post title must be a string, received ${typeof title}`);
  } else if (title.trim().length === 0) {
    errors.push('Post title cannot be empty');
  } else if (title.trim().length < 1) {
    errors.push('Post title must be at least 1 character');
  }

  if (description === null || description === undefined) {
    errors.push('Post description is required (cannot be null or undefined)');
  } else if (typeof description !== 'string') {
    errors.push(`Post description must be a string, received ${typeof description}`);
  } else if (description.trim().length === 0) {
    errors.push('Post description cannot be empty');
  } else if (description.trim().length < 10) {
    errors.push('Post description must be at least 10 characters');
  }

  if (rating !== undefined && rating !== null) {
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      errors.push('Rating must be a number between 1 and 5');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};
