import { Request, Response, NextFunction } from 'express';

/**
 * Validate email format
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
const isStrongPassword = (password: string): boolean => {
  // At least 8 characters, one uppercase, one lowercase, one number
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
};

/**
 * Validate user registration data
 */
export const validateUserRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, username, password } = req.body;

  const errors: string[] = [];

  if (!email || !isValidEmail(email)) {
    errors.push('Invalid email format');
  }

  if (!username || username.length < 3) {
    errors.push('Username must be at least 3 characters');
  }

  if (!password || !isStrongPassword(password)) {
    errors.push(
      'Password must be at least 8 characters with uppercase, lowercase, and numbers'
    );
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

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

/**
 * Validate location creation data
 */
export const validateLocationCreation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name } = req.body;

  if (!name || name.trim().length === 0) {
    return res
      .status(400)
      .json({ error: 'Location name is required' });
  }

  next();
};
