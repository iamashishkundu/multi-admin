const { z } = require('zod');

const inventoryParamSchema = { params: z.object({ id: z.string().uuid('Invalid inventory item UUID') }) };
const createInventorySchema = {
  body: z.object({
    sku: z.string().min(2, 'SKU is required').max(64),
    name: z.string().min(2, 'Name is required').max(255),
    stockQuantity: z.number().int().min(0, 'Stock cannot be negative').default(0),
    unitPrice: z.number().positive('Unit price must be positive'),
  }),
};
const updateInventorySchema = {
  params: z.object({ id: z.string().uuid('Invalid inventory item UUID') }),
  body: z.object({
    name: z.string().min(2).max(255).optional(),
    unitPrice: z.number().positive().optional(),
    stockQuantity: z.number().int().min(0).optional(),
  }),
};

module.exports = { inventoryParamSchema, createInventorySchema, updateInventorySchema };