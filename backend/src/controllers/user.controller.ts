import type { Request, Response } from 'express';
import { prisma } from '../index.js';
import bcrypt from 'bcryptjs';

export class UserController {
    // Get all users (Admin only)
    async getAll(req: Request, res: Response) {
        try {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
            });
            
            res.json({ success: true, data: users });
        } catch (error) {
            console.error('Get users error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    // Create a new user (Admin only)
    async create(req: Request, res: Response) {
        try {
            const { name, email, password, role } = req.body;
            
            //  user already exists(check)
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });
            
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }
            
            // Hash paswerd
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Create usr
            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: role || 'STAFF',
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true,
                },
            });
            
            res.status(201).json({ success: true, data: user });
        } catch (error) {
            console.error('Create user error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }


async delete(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            
            if (isNaN(id)) {
                return res.status(400).json({ message: 'Invalid user ID' });
            }
            
            // Check if user exists
            const user = await prisma.user.findUnique({
                where: { id }
            });
            
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            
           
            //prevebt deleting default amdin
            if (user.email === 'admin@inventory.com') {
                return res.status(403).json({ message: 'Cannot delete the default Admin account' });
            }
            
           
            //preventing sfatt account to be  deleted
            if (user.email === 'staff@inventory.com') {
                return res.status(403).json({ message: 'Cannot delete the default Staff account' });
            }
            
            // Don't allow deleting the last admin
            const adminCount = await prisma.user.count({
                where: { role: 'ADMIN' }
            });
            
            if (user.role === 'ADMIN' && adminCount <= 1) {
                return res.status(400).json({ message: 'Cannot delete the last admin user' });
            }
            
            await prisma.user.delete({
                where: { id }
            });
            
            res.json({ success: true, message: 'User deleted successfully' });
        } catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
}
