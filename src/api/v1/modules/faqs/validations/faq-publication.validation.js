const { z } = require('zod');

const publishFaqSchema = {
  params: z.object({ id: z.string().uuid('Invalid FAQ UUID') }),
  body: z.object({ isPublished: z.boolean() }),
};

module.exports = { publishFaqSchema };