const { z } = require('zod');

const listNotificationsSchema = {
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    type: z.string().optional(),
    isRead: z.enum(['true', 'false']).optional(),
  }),
};

module.exports = { listNotificationsSchema };