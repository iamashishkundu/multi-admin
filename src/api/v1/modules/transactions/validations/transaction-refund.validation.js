const { z } = require('zod');

const refundTransactionSchema = {
  params: z.object({ id: z.string().uuid('Invalid transaction UUID') }),
  body: z.object({ reason: z.string().min(3, 'Refund reason must be at least 3 characters').max(255) }),
};

module.exports = { refundTransactionSchema };