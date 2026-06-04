import { fileURLToPath } from 'url';
import {dirname} from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import type { Request, Response } from 'express';
import { prisma } from '../index.js';
import { createProductSchema, updateProductSchema } from '../utils/validation.js';
import path from 'path';
import fs from 'fs';

export class ProductController {
    // get all products
    async getAll(req: Request, res: Response) {
        try {
            const { search, categoryId, supplierId, status, lowStock } = req.query;

            const where: any = {};

            if (search) {
                where.OR = [
                    { name: { contains: search as string, mode: 'insensitive' } },
                    { SKU: { contains: search as string, mode: 'insensitive' } }
                ];
            }

            if (categoryId) {
                where.categoryId = Number(categoryId);
            }

            if (supplierId) {
                where.supplierId = Number(supplierId);
            }

            if (status) {
                where.status = status;
            }

            if (lowStock === 'true') {
                where.currentStock = { lte: where.minimumStock };
            }

            const products = await prisma.product.findMany({
                where,
                include: {
                    category: true,
                    supplier: true
                },
                orderBy: { createdAt: 'desc' }
            });

            res.json({ success: true, data: products });
        } catch (error) {
            console.error('Getting products error', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    // get single product
    async getOne(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);

            if (isNaN(id)) {
                return res.status(400).json({ message: 'Invalid product ID' });
            }

            const product = await prisma.product.findUnique({
                where: { id },
                include: {
                    category: true,
                    supplier: true,
                    stockMovements: {
                        orderBy: { createdAt: 'desc' },
                        take: 10
                    }
                }
            });

            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            res.json({ success: true, data: product });
        } catch (error) {
            console.error('Getting product error', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    // creating products with image upload
    async create(req: Request, res: Response) {
        try {
            const validation = createProductSchema.safeParse(req.body);

            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    errors: validation.error
                });
            }

            const { SKU, name, description, categoryId, supplierId, unitPrice, sellingPrice, minimumStock } = validation.data;

            const existingProduct = await prisma.product.findUnique({
                where: { SKU }
            });

            if (existingProduct) {
                return res.status(400).json({
                    message: 'Product with this SKU already exists'
                });
            }

            // Get image URL if uploaded
            const imageUrl = (req as any).file?.filename 
                ? `/uploads/${(req as any).file.filename}` 
                : undefined;

            const product = await prisma.product.create({
                data: {
                    SKU,
                    name,
                    description: description?? undefined,
                    imageUrl,
                    categoryId,
                    supplierId: supplierId || null,
                    unitPrice,
                    sellingPrice,
                    minimumStock: minimumStock || 0,
                    currentStock: 0
                },
                include: {
                    category: true,
                    supplier: true
                }
            });

            res.status(201).json({ success: true, data: product });
        } catch (error) {
            console.error('Creating product error', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    // updating product with image upload
    async update(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);

            if (isNaN(id)) {
                return res.status(400).json({ message: 'Invalid product ID' });
            }

            const existingProduct = await prisma.product.findUnique({
                where: { id },
                select: { status: true, imageUrl: true }
            });

            if (!existingProduct) {
                return res.status(404).json({ message: 'Product not found' });
            }

            if (existingProduct.status === 'INACTIVE') {
                return res.status(400).json({ 
                    message: 'Cannot edit inactive product. Please activate it first.' 
                });
            }

            const validation = updateProductSchema.safeParse(req.body);

            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    errors: validation.error
                });
            }

            const { SKU, name, description, categoryId, supplierId, unitPrice, sellingPrice, minimumStock, status } = validation.data;

            const updateData: any = {};

            if (SKU !== undefined) updateData.SKU = SKU;
            if (name !== undefined) updateData.name = name;
            if (description !== undefined) updateData.description = description ?? null;
            if (categoryId !== undefined) updateData.categoryId = categoryId;
            if (supplierId !== undefined) updateData.supplierId = supplierId === null ? null : supplierId;
            if (unitPrice !== undefined) updateData.unitPrice = unitPrice;
            if (sellingPrice !== undefined) updateData.sellingPrice = sellingPrice;
            if (minimumStock !== undefined) updateData.minimumStock = minimumStock;
            if (status !== undefined) updateData.status = status;

            // Handle image upload
            if ((req as any).file) {
                // Delete old image if exists
                if (existingProduct.imageUrl) {
                    const oldImagePath = path.join(__dirname, '../../', existingProduct.imageUrl);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
                updateData.imageUrl = `/uploads/${(req as any).file.filename}`;
            }

            console.log('Updating product with SKU:', SKU);
            const product = await prisma.product.update({
                where: { id },
                data: updateData,
                include: {
                    category: true,
                    supplier: true
                }
            });
            console.log('Product updated:', product);
            res.json({ success: true, data: product });
        } catch (error) {
            console.error('Updating product error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    // deactivate product
    async deactivate(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);

            if (isNaN(id)) {
                return res.status(400).json({ message: 'Invalid product ID' });
            }

            const product = await prisma.product.update({
                where: { id },
                data: { status: 'INACTIVE' }
            });

            res.json({ success: true, data: product, message: 'Product deactivated' });
        } catch (error) {
            console.error('Deactivating product error', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    // activate product
    async activate(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);

            if (isNaN(id)) {
                return res.status(400).json({ message: 'Invalid product ID' });
            }

            const product = await prisma.product.update({
                where: { id },
                data: { status: 'ACTIVE' }
            });

            res.json({ success: true, data: product, message: 'Product activated successfully' });
        } catch (error) {
            console.error('Activating product error', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
}