import { z } from 'zod';

const emailSchema = z.string().trim().email('Enter a valid email address').max(254).transform((value) => value.toLowerCase());
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters').max(128)
  .regex(/[A-Z]/, 'Include an uppercase letter')
  .regex(/[0-9]/, 'Include a number')
  .regex(/[!@#$%&?]/, 'Include a special character');

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().trim().min(2).max(80),
  shopName: z.string().trim().min(2).max(100),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(500).optional(),
});

export const updateCategorySchema = createCategorySchema.partial().refine((value) => Object.keys(value).length > 0);

export const createSupplierSchema = z.object({
  name: z.string().trim().min(1).max(100),
  contactPerson: z.string().trim().max(100).optional(),
  phone: z.string().trim().max(30).optional(),
  email: emailSchema.optional(),
  address: z.string().trim().max(300).optional(),
});

export const updateSupplierSchema = createSupplierSchema.partial().refine((value) => Object.keys(value).length > 0);

export const createProductSchema = z.object({
  SKU: z.string().trim().min(2).max(80),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).optional(),
  categoryId: z.coerce.number().int().positive(),
  supplierId: z.coerce.number().int().positive().nullable().optional(),
  unitPrice: z.coerce.number().min(0).finite(),
  sellingPrice: z.coerce.number().min(0).finite(),
  minimumStock: z.coerce.number().int().min(0).optional().default(0),
});

export const updateProductSchema = z.object({
  SKU: z.string().trim().min(2).max(80).optional(),
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(1000).optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  supplierId: z.coerce.number().int().positive().nullable().optional(),
  unitPrice: z.coerce.number().min(0).finite().optional(),
  sellingPrice: z.coerce.number().min(0).finite().optional(),
  minimumStock: z.coerce.number().int().min(0).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
}).refine((value) => Object.keys(value).length > 0);

export const createStockMovementSchema = z.object({
  productId: z.coerce.number().int().positive(),
  movementType: z.enum(['STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT', 'RETURN']),
  quantity: z.coerce.number().int().positive(),
  reason: z.string().trim().max(500).optional(),
  reference: z.string().trim().max(120).optional(),
});

export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(['ADMIN', 'STAFF']).default('STAFF'),
});
