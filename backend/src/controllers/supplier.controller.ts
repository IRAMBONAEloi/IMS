import type { Request, Response } from 'express';
import { prisma } from '../db.js';
import { createSupplierSchema, updateSupplierSchema } from '../utils/validation.js';

const shopIdFor = (req: Request) => req.user!.shopId;
const statusCode = (error: unknown) => (error as { code?: string })?.code;

export class SupplierController {
  async getAll(req: Request, res: Response) {
    try {
      const suppliers = await prisma.supplier.findMany({
        where: { shopId: shopIdFor(req) },
        include: { _count: { select: { products: true } } },
        orderBy: { name: 'asc' },
      });
      return res.json({ success: true, data: suppliers });
    } catch (error) {
      console.error('Supplier list failed:', error instanceof Error ? error.message : 'Unknown error');
      return res.status(500).json({ message: 'Unable to load suppliers.' });
    }
  }

  async getOne(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid supplier ID.' });
    try {
      const supplier = await prisma.supplier.findFirst({
        where: { id, shopId: shopIdFor(req) },
        include: { products: { where: { shopId: shopIdFor(req) } } },
      });
      if (!supplier) return res.status(404).json({ message: 'Supplier not found.' });
      return res.json({ success: true, data: supplier });
    } catch (error) {
      console.error('Supplier lookup failed:', error instanceof Error ? error.message : 'Unknown error');
      return res.status(500).json({ message: 'Unable to load supplier.' });
    }
  }

  async create(req: Request, res: Response) {
    const validation = createSupplierSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ message: 'Check the supplier details.', errors: validation.error.flatten() });
    try {
      const supplier = await prisma.supplier.create({ data: { ...validation.data, shopId: shopIdFor(req) } });
      return res.status(201).json({ success: true, data: supplier });
    } catch (error) {
      if (statusCode(error) === 'P2002') return res.status(409).json({ message: 'A supplier with that name already exists.' });
      console.error('Supplier create failed:', error instanceof Error ? error.message : 'Unknown error');
      return res.status(500).json({ message: 'Unable to create supplier.' });
    }
  }

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid supplier ID.' });
    const validation = updateSupplierSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ message: 'Check the supplier details.', errors: validation.error.flatten() });
    try {
      const result = await prisma.supplier.updateMany({ where: { id, shopId: shopIdFor(req) }, data: validation.data });
      if (!result.count) return res.status(404).json({ message: 'Supplier not found.' });
      const supplier = await prisma.supplier.findFirst({ where: { id, shopId: shopIdFor(req) } });
      return res.json({ success: true, data: supplier });
    } catch (error) {
      if (statusCode(error) === 'P2002') return res.status(409).json({ message: 'A supplier with that name already exists.' });
      console.error('Supplier update failed:', error instanceof Error ? error.message : 'Unknown error');
      return res.status(500).json({ message: 'Unable to update supplier.' });
    }
  }

  async delete(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid supplier ID.' });
    try {
      const result = await prisma.supplier.deleteMany({ where: { id, shopId: shopIdFor(req) } });
      if (!result.count) return res.status(404).json({ message: 'Supplier not found.' });
      return res.json({ success: true, message: 'Supplier deleted.' });
    } catch (error) {
      if (statusCode(error) === 'P2003') return res.status(409).json({ message: 'Remove this supplier from its products before deleting it.' });
      console.error('Supplier delete failed:', error instanceof Error ? error.message : 'Unknown error');
      return res.status(500).json({ message: 'Unable to delete supplier.' });
    }
  }
}
