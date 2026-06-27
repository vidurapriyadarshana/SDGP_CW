import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: 'Admin' | 'Student' | 'SuperAdmin';
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string; role: 'Admin' | 'Student' | 'SuperAdmin' };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired session token.' });
  }
};

export const roleGuard = (allowedRoles: ('Admin' | 'Student' | 'SuperAdmin')[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
      return;
    }
    // SuperAdmins automatically pass role checks intended for Admins
    const isSuperAdmin = req.user.role === 'SuperAdmin';
    const isAllowed = allowedRoles.includes(req.user.role) || (isSuperAdmin && allowedRoles.includes('Admin'));

    if (!isAllowed) {
      res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
      return;
    }
    next();
  };
};
