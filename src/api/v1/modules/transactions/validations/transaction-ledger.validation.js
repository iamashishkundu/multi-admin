const { z } = require('zod');

const transactionParamSchema = { params: z.object({ id: z.string().uuid('Invalid transaction UUID') }) };
const listTransactionsSchema = {
  query: z.object({
    page: z.string().optional(), limit: z.string().optional(),
    type: z.enum(['deposit', 'withdrawal', 'payment', 'refund', 'adjustment']).optional(),
    status: z.enum(['pending', 'completed', 'failed', 'refunded']).optional(),
    userId: z.string().uuid().optional(), sortBy: z.string().optional(),
    sortOrder: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional(),
  }),
};
const exportTransactionsSchema = {
  body: z.object({
    format: z.enum(['json', 'csv']).default('json'),
    type: z.enum(['deposit', 'withdrawal', 'payment', 'refund', 'adjustment']).optional(),
    status: z.enum(['pending', 'completed', 'failed', 'refunded']).optional(),
    startDate: z.string().datetime().optional(), endDate: z.string().datetime().optional(),
  }),
};

module.exports = { transactionParamSchema, listTransactionsSchema, exportTransactionsSchema };