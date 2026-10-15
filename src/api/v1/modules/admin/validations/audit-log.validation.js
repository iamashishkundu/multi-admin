const { z } = require('zod');

const listAuditLogsSchema = {
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    module: z.string().optional(),
    action: z.string().optional(),
    actorId: z.string().uuid().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional(),
  }),
};

module.exports = { listAuditLogsSchema };