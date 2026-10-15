const { z } = require('zod');

const createOrderSchema = {
  body: z.object({
    items: z.array(z.object({
      inventoryId: z.string().uuid('Invalid inventory UUID'),
      quantity: z.number().int().positive('Quantity must be at least 1'),
    })).min(1, 'Order must contain at least one item'),
  }),
};

module.exports = { createOrderSchema };