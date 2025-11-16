import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase.js';

// Extend Express Request type to include user information
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        role?: string;
      };
      accessToken?: string;
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header and attaches user info to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid authorization header',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
        details: error?.message,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Attach user information to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    req.accessToken = token;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Authentication failed',
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user info if token is present, but doesn't require it
 */
export const optionalAuthenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user info
      next();
      return;
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (!error && user) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
      req.accessToken = token;
    }

    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    // Continue without user info on error
    next();
  }
};
