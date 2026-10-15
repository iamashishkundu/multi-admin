const { z } = require('zod');
const { ALL_STATUSES } = require('../orders.constants');

const updateOrderStatusSchema = {
  params: z.object({ id: z.string().uuid('Invalid order UUID') }),
  body: z.object({
    status: z.enum(ALL_STATUSES, { errorMap: () => ({ message: `Status must be one of: ${ALL_STATUSES.join(', ')}` }) }),
  }),
};

module.exports = { updateOrderStatusSchema };