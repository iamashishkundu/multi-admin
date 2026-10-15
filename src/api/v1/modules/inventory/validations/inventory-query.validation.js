const { z } = require('zod');

const listInventorySchema = {
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional(),
  }),
};

module.exports = { listInventorySchema };