import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { errorResponse } from '../utils/errorResponse.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json(errorResponse(401, 'Access token required'));
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch {
    return res.status(401).json(errorResponse(401, 'Invalid or expired token'));
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json(errorResponse(401, 'Unauthorized'));
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json(errorResponse(403, 'Admin access required'));
  }

  next();
};

export const requireRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json(errorResponse(401, 'Unauthorized'));
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json(errorResponse(403, 'Access denied for this role'));
    }

    next();
  };
};
