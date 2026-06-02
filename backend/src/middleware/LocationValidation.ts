import { Request, Response, NextFunction } from 'express';

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
};