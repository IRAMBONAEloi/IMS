import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db.js';
import { createUserSchema } from '../utils/validation.js';

const shopIdFor = (req: Request) => req.user!.shopId;
const statusCode = (error: unknown) => (error as { code?: string })?.code;

export class UserController {
  async getAll(req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany({
        where: { shopId: shopIdFor(req) },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      });
      return res.json({ success: true, data: users });
    } catch (error) {
      console.error('User list failed:', error instanceof Error ? error.message : 'Unknown error');
      return res.status(500).json({ message: 'Unable to load team members.' });
    }
  }

  async create(req: Request, res: Response) {
    const validation = createUserSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ message: 'Check the team member details.', errors: validation.error.flatten() });
    try {
      const { name, email, password, role } = validation.data;
      const user = await prisma.user.create({
        data: { name, email, password: await bcrypt.hash(password, 12), role, shopId: shopIdFor(req) },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      });
      return res.status(201).json({ success: true, data: user });
    } catch (error) {
      if (statusCode(error) === 'P2002') return res.status(409).json({ message: 'That email is already in use.' });
      console.error('User create failed:', error instanceof Error ? error.message : 'Unknown error');
      return res.status(500).json({ message: 'Unable to add this team member.' });
    }
  }

  async delete(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid user ID.' });
    const shopId = shopIdFor(req);
    if (req.user!.id === id) return res.status(400).json({ message: 'You cannot remove your own account.' });
    try {
      const user = await prisma.user.findFirst({ where: { id, shopId }, select: { id: true, role: true } });
      if (!user) return res.status(404).json({ message: 'Team member not found.' });
      if (user.role === 'ADMIN' && await prisma.user.count({ where: { shopId, role: 'ADMIN' } }) <= 1) {
        return res.status(409).json({ message: 'A workspace must keep at least one administrator.' });
      }
      await prisma.user.deleteMany({ where: { id, shopId } });
      return res.json({ success: true, message: 'Team member removed.' });
    } catch (error) {
      if (statusCode(error) === 'P2003') return res.status(409).json({ message: 'This account has stock history and cannot be removed.' });
      console.error('User delete failed:', error instanceof Error ? error.message : 'Unknown error');
      return res.status(500).json({ message: 'Unable to remove this team member.' });
    }
  }
}
