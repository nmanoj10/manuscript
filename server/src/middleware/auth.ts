import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

export interface AuthRequest extends Request {
  user?: { email: string; role: string };
  userId?: string;
  token?: string;
}

// Middleware to parse JWT or user headers
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Try JWT first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.slice(7);
      const decoded: any = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.userId;
      req.user = { email: decoded.email, role: decoded.role };
      req.token = token;
      return next();
    } catch (error) {
      console.error('JWT verification error:', error);
    }
  }

  // Fallback to headers (for backward compatibility)
  const email = req.headers['x-user-email'] as string;
  const role = req.headers['x-user-role'] as string;

  if (email) {
    req.user = { email, role: role || 'user' };
  }

  next();
};

// Require authentication middleware
export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.userId && !req.user?.email) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Middleware to check admin role
export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Middleware for error handling
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  
  res.status(status).json({
    error: {
      status,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};
