import type { Request, Response } from 'express';
import { prisma } from '../db.js';

export class DashboardController {
  async getSummary(req: Request, res: Response) {
    const shopId = req.user!.shopId;
    try {
      const [totalProducts, activeProducts, totalCategories, totalSuppliers, allProducts, recentMovements] = await Promise.all([
        prisma.product.count({ where: { shopId } }),
        prisma.product.count({ where: { shopId, status: 'ACTIVE' } }),
        prisma.category.count({ where: { shopId } }),
        prisma.supplier.count({ where: { shopId } }),
        prisma.product.findMany({ where: { shopId, status: 'ACTIVE' }, select: { currentStock: true, minimumStock: true, unitPrice: true } }),
        prisma.stockMovement.findMany({
          where: { shopId },
          take: 8,
          orderBy: { createdAt: 'desc' },
          include: { product: { select: { name: true, SKU: true, imageUrl: true } }, user: { select: { name: true } } },
        }),
      ]);
      const activeItems = allProducts;
      const lowStockProducts = activeItems.filter((product) => product.currentStock > 0 && product.currentStock <= product.minimumStock).length;
      const outofStockProducts = activeItems.filter((product) => product.currentStock === 0).length;
      const totalStockValue = activeItems.reduce((sum, product) => sum + product.currentStock * product.unitPrice, 0);
      return res.json({
        success: true,
        data: { totalProducts, activeProducts, totalCategories, totalSuppliers, totalStockValue, lowStockProducts, outofStockProducts, recentMovements },
      });
    } catch (error) {
      console.error('Dashboard summary failed:', error instanceof Error ? error.message : 'Unknown error');
      return res.status(500).json({ message: 'Unable to load dashboard summary.' });
    }
  }
}
