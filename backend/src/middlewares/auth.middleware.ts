import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { prisma } from '../db.js';

export interface SessionUser {
  id: number;
  email: string;
  role: 'ADMIN' | 'STAFF';
  shopId: number;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: SessionUser;
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const cookieToken = req.cookies?.ims_session as string | undefined;
  const authorization = req.get('authorization');
  const legacyToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  const token = cookieToken ?? legacyToken;

  if (!token) return res.status(401).json({ message: 'Authentication required' });

  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(503).json({ message: 'Authentication is not configured' });

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload & Partial<SessionUser>;
    if (!Number.isInteger(decoded.id) || !Number.isInteger(decoded.shopId)) {
      return res.status(401).json({ message: 'Invalid session' });
    }

    const account = await prisma.user.findFirst({
      where: { id: decoded.id, shopId: decoded.shopId },
      select: { id: true, email: true, role: true, shopId: true },
    });
    if (!account) return res.status(401).json({ message: 'Session is no longer valid' });

    req.user = account;
    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Session expired or invalid' });
    }
    console.error('Session verification failed:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(503).json({ message: 'Authentication is temporarily unavailable' });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ message: 'Admin access required' });
  return next();
};
