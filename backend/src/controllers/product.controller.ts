import type { Request, Response } from 'express';
import { prisma } from '../db.js';
import { createProductSchema, updateProductSchema } from '../utils/validation.js';

const statusCode = (error: unknown) => (error as { code?: string })?.code;
const shopIdFor = (req: Request) => req.user!.shopId;
const uploadedImage = (req: Request) => (req as Request & { file?: Express.Multer.File }).file?.filename;

export class ProductController {
  async getAll(req: Request, res: Response) {
    try {
      const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
      const categoryId = Number(req.query.categoryId);
      const supplierId = Number(req.query.supplierId);
      const status = req.query.status === 'ACTIVE' || req.query.status === 'INACTIVE' ? req.query.status : undefined;
      const products = await prisma.product.findMany({
        where: {
          shopId: shopIdFor(req),
          ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' as const } }, { SKU: { contains: search, mode: 'insensitive' as const } }] } : {}),
          ...(Number.isInteger(categoryId) && categoryId > 0 ? { categoryId } : {}),
          ...(Number.isInteger(supplierId) && supplierId > 0 ? { supplierId } : {}),
          ...(status ? { status } : {}),
        },
        include: { category: true, supplier: true },
        orderBy: { updatedAt: 'desc' },
      });
      const data = req.query.lowStock === 'true'
        ? products.filter((product) => product.status === 'ACTIVE' && product.currentStock <= product.minimumStock)
        : products;
      return res.json({ success: true, data });
    } catch (error) {
      console.error('Product list failed:', error instanceof Error ? error.message : 'Unknown error');
      return res.status(500).json({ message: 'Unable to load products.' });
    }
  }

  async getOne(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid product ID.' });
    try {
      const product = await prisma.product.findFirst({
        where: { id, shopId: shopIdFor(req) },
        include: {
          category: true,
          supplier: true,
          stockMovements: { where: { shopId: shopIdFor(req) }, orderBy: { createdAt: 'desc' }, take: 10 },
        },
      });
      if (!product) return res.status(404).json({ message: 'Product not found.' });
      return res.json({ success: true, data: product });
    } catch (error) {
      console.error('Product lookup failed:', error instanceof Error ? error.message : 'Unknown error');
      return res.status(500).json({ message: 'Unable to load product.' });
    }
  }

  async create(req: Request, res: Response) {
    const validation = createProductSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ message: 'Check the product details.', errors: validation.error.flatten() });
    const shopId = shopIdFor(req);
    const { categoryId, supplierId } = validation.data;
    try {
      const [category, supplier, existing] = await Promise.all([
        prisma.category.findFirst({ where: { id: categoryId, shopId }, select: { id: true } }),
        supplierId ? prisma.supplier.findFirst({ where: { id: supplierId, shopId }, select: { id: true } }) : Promise.resolve(true),
        prisma.product.findFirst({ where: { SKU: validation.data.SKU, shopId }, select: { id: true } }),
      ]);
      if (!category) return res.status(400).json({ message: 'Choose a category in this workspace.' });
      if (!supplier) return res.status(400).json({ message: 'Choose a supplier in this workspace.' });
      if (existing) return res.status(409).json({ message: 'That SKU is already in use in this workspace.' });

      const product = await prisma.product.create({
        data: {
          ...validation.data,
          description: validation.data.description ?? '',
          imageUrl: uploadedImage(req) ? `/uploads/${uploadedImage(req)}` : null,
          supplierId: supplierId ?? null,
          currentStock: 0,
          shopId,
        },
        include: { category: true, supplier: true },
      });
      return res.status(201).json({ success: true, data: product });
    } catch (error) {
      if (statusCode(error) === 'P2002') return res.status(409).json({ message: 'That SKU is already in use in this workspace.' });
      console.error('Product create failed:', error instanceof Error ? error.message : 'Unknown error');
      return res.status(500).json({ message: 'Unable to create product.' });
    }
  }

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid product ID.' });
    const validation = updateProductSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ message: 'Check the product details.', errors: validation.error.flatten() });
    const shopId = shopIdFor(req);
    try {
      const existing = await prisma.product.findFirst({ where: { id, shopId }, select: { id: true, status: true } });
      if (!existing) return res.status(404).json({ message: 'Product not found.' });
      if (existing.status === 'INACTIVE') return res.status(409).json({ message: 'Activate this product before editing it.' });

      const { categoryId, supplierId } = validation.data;
      if (categoryId !== undefined && !await prisma.category.findFirst({ where: { id: categoryId, shopId }, select: { id: true } })) {
        return res.status(400).json({ message: 'Choose a category in this workspace.' });
      }
      if (supplierId && !await prisma.supplier.findFirst({ where: { id: supplierId, shopId }, select: { id: true } })) {
        return res.status(400).json({ message: 'Choose a supplier in this workspace.' });
      }

      const result = await prisma.product.updateMany({
        where: { id, shopId },
        data: {
          ...validation.data,
          ...(uploadedImage(req) ? { imageUrl: `/uploads/${uploadedImage(req)}` } : {}),
        },
      });
      if (!result.count) return res.status(404).json({ message: 'Product not found.' });
      const product = await prisma.product.findFirst({ where: { id, shopId }, include: { category: true, supplier: true } });
      return res.json({ success: true, data: product });
    } catch (error) {
      if (statusCode(error) === 'P2002') return res.status(409).json({ message: 'That SKU is already in use in this workspace.' });
      console.error('Product update failed:', error instanceof Error ? error.message : 'Unknown error');
      return res.status(500).json({ message: 'Unable to update product.' });
    }
  }

  async deactivate(req: Request, res: Response) {
    return this.setStatus(req, res, 'INACTIVE');
  }

  async activate(req: Request, res: Response) {
    return this.setStatus(req, res, 'ACTIVE');
  }

  private async setStatus(req: Request, res: Response, status: 'ACTIVE' | 'INACTIVE') {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid product ID.' });
    try {
      const result = await prisma.product.updateMany({ where: { id, shopId: shopIdFor(req) }, data: { status } });
      if (!result.count) return res.status(404).json({ message: 'Product not found.' });
      const product = await prisma.product.findFirst({ where: { id, shopId: shopIdFor(req) } });
      return res.json({ success: true, data: product, message: `Product ${status === 'ACTIVE' ? 'activated' : 'deactivated'}.` });
    } catch (error) {
      console.error('Product status update failed:', error instanceof Error ? error.message : 'Unknown error');
      return res.status(500).json({ message: 'Unable to update product status.' });
    }
  }
}
