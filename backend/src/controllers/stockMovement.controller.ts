import type { Request, Response } from 'express';
import { prisma } from '../db.js';
import { createStockMovementSchema } from '../utils/validation.js';

export class StockMovementController {
  async create(req: Request, res: Response) {
    const validation = createStockMovementSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ message: 'Check the movement details.', errors: validation.error.flatten() });
    if (!req.user) return res.status(401).json({ message: 'Authentication required.' });

    const { productId, movementType, quantity, reason, reference } = validation.data;
    const shopId = req.user.shopId;
    try {
      const movement = await prisma.$transaction(async (tx) => {
        const rows = await tx.$queryRaw<Array<{ id: number; currentStock: number }>>`
          SELECT "id", "currentStock" FROM "Product" WHERE "id" = ${productId} AND "shopId" = ${shopId} FOR UPDATE
        `;
        const product = rows[0];
        if (!product) throw Object.assign(new Error('Product not found.'), { status: 404 });

        const previousStock = product.currentStock;
        let newStock = previousStock;
        if (movementType === 'STOCK_IN' || movementType === 'RETURN') newStock += quantity;
        if (movementType === 'STOCK_OUT') {
          if (quantity > previousStock) throw Object.assign(new Error(`Only ${previousStock} units are available.`), { status: 409 });
          newStock -= quantity;
        }
        if (movementType === 'ADJUSTMENT') newStock = quantity;

        await tx.product.updateMany({ where: { id: productId, shopId }, data: { currentStock: newStock } });
        return tx.stockMovement.create({
          data: {
            productId,
            movementType,
            quantity,
            previousStock,
            newStock,
            reason: reason || null,
            reference: reference || null,
            userId: req.user!.id,
            shopId,
          },
          include: { product: { select: { name: true, SKU: true, imageUrl: true } }, user: { select: { name: true } } },
        });
      }, { isolationLevel: 'Serializable' });
      return res.status(201).json({ success: true, data: movement });
    } catch (error) {
      const status = (error as { status?: number }).status;
      if (status) return res.status(status).json({ message: error instanceof Error ? error.message : 'Stock update failed.' });
      if ((error as { code?: string }).code === 'P2034') return res.status(409).json({ message: 'Stock changed while saving. Refresh and try again.' });
      console.error('Stock movement failed:', error instanceof Error ? error.message : 'Unknown error');
      return res.status(500).json({ message: 'Unable to record this stock movement.' });
    }
  }

  async getAll(req: Request, res: Response) {
    const productId = req.query.productId === undefined ? undefined : Number(req.query.productId);
    if (productId !== undefined && (!Number.isInteger(productId) || productId < 1)) return res.status(400).json({ message: 'Invalid product ID.' });
    const startDate = typeof req.query.startDate === 'string' ? new Date(req.query.startDate) : undefined;
    const endDate = typeof req.query.endDate === 'string' ? new Date(req.query.endDate) : undefined;
    if ((startDate && Number.isNaN(startDate.valueOf())) || (endDate && Number.isNaN(endDate.valueOf()))) return res.status(400).json({ message: 'Invalid date range.' });
    try {
      const movements = await prisma.stockMovement.findMany({
        where: {
          shopId: req.user!.shopId,
          ...(productId ? { productId } : {}),
          ...(req.query.movementType ? { movementType: String(req.query.movementType) as 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT' | 'RETURN' } : {}),
          ...(startDate || endDate ? { createdAt: { ...(startDate ? { gte: startDate } : {}), ...(endDate ? { lte: endDate } : {}) } } : {}),
        },
        include: { product: { select: { name: true, SKU: true, imageUrl: true } }, user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 500,
      });
      return res.json({ success: true, data: movements });
    } catch (error) {
      console.error('Stock movement list failed:', error instanceof Error ? error.message : 'Unknown error');
      return res.status(500).json({ message: 'Unable to load stock movements.' });
    }
  }
}
