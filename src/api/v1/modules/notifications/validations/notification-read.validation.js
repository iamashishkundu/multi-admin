const { z } = require('zod');

const notificationParamSchema = {
  params: z.object({ id: z.string().uuid('Invalid notification UUID') }),
};

module.exports = { notificationParamSchema };