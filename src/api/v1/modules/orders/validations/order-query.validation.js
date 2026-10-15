const { z } = require('zod');
const { ALL_STATUSES } = require('../orders.constants');

const orderParamSchema = { params: z.object({ id: z.string().uuid('Invalid order UUID') }) };
const listOrdersSchema = {
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.enum(ALL_STATUSES).optional(),
    userId: z.string().uuid().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional(),
  }),
};

module.exports = { orderParamSchema, listOrdersSchema };