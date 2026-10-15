const { z } = require('zod');

const adjustStockSchema = {
  params: z.object({ id: z.string().uuid('Invalid inventory item UUID') }),
  body: z.object({
    adjustmentQuantity: z.number().int().refine((value) => value !== 0, 'Adjustment quantity cannot be 0'),
    reason: z.string().min(3, 'Adjustment reason is required').max(255),
  }),
};

module.exports = { adjustStockSchema };