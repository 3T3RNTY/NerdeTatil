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
  const { description, rating } = req.body;

  const errors: string[] = [];

  if (!description || description.trim().length === 0) {
    errors.push('Post description is required');
  }

  if (rating && (rating < 1 || rating > 5)) {
    errors.push('Rating must be between 1 and 5');
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
