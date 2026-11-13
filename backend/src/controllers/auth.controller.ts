import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'node:crypto';
import { prisma } from '../db.js';
import { loginSchema, registerSchema } from '../utils/validation.js';
import type { SessionUser } from '../middlewares/auth.middleware.js';

const sessionCookie = 'ims_session';
const sessionDuration = 12 * 60 * 60 * 1000;

function issueSession(user: SessionUser, res: Response) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');

  const token = jwt.sign(user, secret, { expiresIn: '12h' });
  res.cookie(sessionCookie, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: sessionDuration,
  });
}

function publicUser(user: { id: number; email: string; name: string; role: string; shopId: number; shop: { name: string; currency: string } }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    shopId: user.shopId,
    shopName: user.shop.name,
    currency: user.shop.currency,
  };
}

export class AuthController {
  async login(req: Request, res: Response) {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ message: 'Check your email and password.' });

    try {
      const user = await prisma.user.findUnique({
        where: { email: validation.data.email },
        include: { shop: { select: { name: true, currency: true } } },
      });
      if (!user || !(await bcrypt.compare(validation.data.password, user.password))) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      issueSession({ id: user.id, email: user.email, role: user.role, shopId: user.shopId }, res);
      return res.json({ success: true, user: publicUser(user) });
    } catch (error) {
      console.error('Login failed:', error instanceof Error ? error.message : 'Unknown error');
      return res.status(500).json({ message: 'Unable to sign in right now.' });
    }
  }

  async register(req: Request, res: Response) {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ message: 'Check the details and try again.', errors: validation.error.flatten() });

    try {
      const { name, email, password, shopName } = validation.data;
      const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
      if (existing) return res.status(409).json({ message: 'An account with this email already exists.' });

      const passwordHash = await bcrypt.hash(password, 12);
      const baseSlug = shopName.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'shop';
      const user = await prisma.$transaction(async (transaction) => {
        const shop = await transaction.shop.create({
          data: {
            name: shopName,
            slug: `${baseSlug}-${randomBytes(3).toString('hex')}`,
            currency: 'RWF',
            timezone: 'Africa/Kigali',
          },
        });
        return transaction.user.create({
          data: { name, email, password: passwordHash, role: 'ADMIN', shopId: shop.id },
          include: { shop: { select: { name: true, currency: true } } },
        });
      });

      issueSession({ id: user.id, email: user.email, role: user.role, shopId: user.shopId }, res);
      return res.status(201).json({ success: true, user: publicUser(user) });
    } catch (error) {
      console.error('Registration failed:', error instanceof Error ? error.message : 'Unknown error');
      return res.status(500).json({ message: 'Unable to create your workspace right now.' });
    }
  }

  async me(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    try {
      const user = await prisma.user.findFirst({
        where: { id: req.user.id, shopId: req.user.shopId },
        include: { shop: { select: { name: true, currency: true } } },
      });
      if (!user) return res.status(401).json({ message: 'Session is no longer valid' });
      return res.json({ success: true, user: publicUser(user) });
    } catch (error) {
      console.error('Session lookup failed:', error instanceof Error ? error.message : 'Unknown error');
      return res.status(500).json({ message: 'Unable to load your session.' });
    }
  }

  logout(_req: Request, res: Response) {
    res.clearCookie(sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    return res.status(204).end();
  }
}
