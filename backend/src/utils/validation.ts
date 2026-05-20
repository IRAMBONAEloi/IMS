import { z } from 'zod';

export const registerSchema = z.object({

email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be atleast 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[!@#$%&?]/, 'Must contain special character'),
    name:z.string().min(2 , 'Must be atleast 2 characters'),

}) ;

export const loginSchema = z.object({

    email:z.string().email('Invalid email format'),
    password:z.string().min(1,'Password required'),
});

export const createCategorySchema = z.object({

    name: z.string().min(1, 'Category name is required'),
    description: z.string ().optional(),

});

export const updateCategorySchema = z.object({

    name : z.string().min(1, 'Category name is required'),
    description: z.string().optional(),

});

export const createSupplierSchema = z.object({
    name: z.string().min(1, 'Supplier name is required'),
    contactPerson: z.string().optional(),
    phone : z.string()
    .regex(/07\d{8}$/, 'Phone must be exact 10 digit starting with 07')
    .optional(),
    email: z.string().email('Invalid email format').optional(),
    address: z.string().optional(),
});

export const updateSupplierSchema = z.object({

    name: z.string().min(1, 'Supplier name is required'),
    contactPerson: z.string().optional(),
    phone : z.string()
    .regex(/07\d{8}$/, 'Phone must be exact 10 digit starting with 07')
    .optional(),
    email:z.string().email('Invalid email format'),
    address: z.string().optional(),
});

export const createProductSchema = z.object({
    SKU: z.string().min(2, 'SKU is required'),
    name: z.string().min(1, 'Product name is required '),
    description: z.string().optional(),
    categoryId: z.number().int().positive('Valid category ID is required'),
    supplierId: z.number().int().optional().optional().nullable(),
    unitPrice: z.number().positive('Unit price must be positive'),
    sellingPrice : z.number().positive('Selling price must be positive'),
    minimumStock: z.number().int().min(0, 'Minimum stock can not be negative').optional().default(0),


});

export const updateProductSchema = z.object({

    SKU: z.string().min(2, 'Sku is required'),
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    categoryId: z.number().int().positive().optional(),
    supplierId: z.number().int().positive().optional().nullable(),
    unitPrice : z.number().positive().optional(),
    sellingPrice: z.number().positive().optional(),
    minimumStock: z.number().int().min(0).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),

});

export const createStockMovementSchema = z.object({

    productId: z.number().int().positive('Valid product ID is required'),
    movementType: z.enum(['STOCK_IN','STOCK_OUT', 'ADJUSTMENT', 'RETURN']),
    quantity: z.number().int().positive('Quantity must be greater than zero'),

    reason: z.string().optional(),
    reference: z.string().optional(),

});