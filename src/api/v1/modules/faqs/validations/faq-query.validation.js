const { z } = require('zod');

const listFaqsSchema = {
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    category: z.string().optional(),
    isPublished: z.enum(['true', 'false']).optional(),
  }),
};

module.exports = { listFaqsSchema };