import type { Request, Response } from 'express';
import { prisma } from '../db.js';
import { createCategorySchema, updateCategorySchema } from '../utils/validation.js';

const shopIdFor = (req: Request) => req.user!.shopId;
const statusCode = (error: unknown) => (error as { code?: string })?.code;

export class categoryController {
  async getAll(req: Request, res: Response) {
    try {
      const categories = await prisma.category.findMany({
        where: { shopId: shopIdFor(req) },
        include: { _count: { select: { products: true } } },
        orderBy: { name: 'asc' },
      });
      return res.json({ success: true, data: categories });
    } catch (error) {
      console.error('Category list failed:', error instanceof Error ? error.message : 'Unknown error');
      return res.status(500).json({ message: 'Unable to load categories.' });
    }
  }

  async getOne(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid category ID.' });
    try {
      const category = await prisma.category.findFirst({
        where: { id, shopId: shopIdFor(req) },
        include: { products: { where: { shopId: shopIdFor(req) } } },
      });
      if (!category) return res.status(404).json({ message: 'Category not found.' });
      return res.json({ success: true, data: category });
    } catch (error) {
      console.error('Category lookup failed:', error instanceof Error ? error.message : 'Unknown error');
      return res.status(500).json({ message: 'Unable to load category.' });
    }
  }

  async create(req: Request, res: Response) {
    const validation = createCategorySchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ message: 'Check the category details.', errors: validation.error.flatten() });
    try {
      const category = await prisma.category.create({ data: { ...validation.data, shopId: shopIdFor(req) } });
      return res.status(201).json({ success: true, data: category });
    } catch (error) {
      if (statusCode(error) === 'P2002') return res.status(409).json({ message: 'A category with that name already exists.' });
      console.error('Category create failed:', error instanceof Error ? error.message : 'Unknown error');
      return res.status(500).json({ message: 'Unable to create category.' });
    }
  }

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid category ID.' });
    const validation = updateCategorySchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ message: 'Check the category details.', errors: validation.error.flatten() });
    try {
      const result = await prisma.category.updateMany({ where: { id, shopId: shopIdFor(req) }, data: validation.data });
      if (!result.count) return res.status(404).json({ message: 'Category not found.' });
      const category = await prisma.category.findFirst({ where: { id, shopId: shopIdFor(req) } });
      return res.json({ success: true, data: category });
    } catch (error) {
      if (statusCode(error) === 'P2002') return res.status(409).json({ message: 'A category with that name already exists.' });
      console.error('Category update failed:', error instanceof Error ? error.message : 'Unknown error');
      return res.status(500).json({ message: 'Unable to update category.' });
    }
  }

  async delete(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid category ID.' });
    try {
      const result = await prisma.category.deleteMany({ where: { id, shopId: shopIdFor(req) } });
      if (!result.count) return res.status(404).json({ message: 'Category not found.' });
      return res.json({ success: true, message: 'Category deleted.' });
    } catch (error) {
      if (statusCode(error) === 'P2003') return res.status(409).json({ message: 'Move products to another category before deleting this one.' });
      console.error('Category delete failed:', error instanceof Error ? error.message : 'Unknown error');
      return res.status(500).json({ message: 'Unable to delete category.' });
    }
  }
}
