const { z } = require('zod');

const resolveTicketSchema = {
  params: z.object({ id: z.string().uuid('Invalid ticket UUID') }),
  body: z.object({ resolutionNote: z.string().min(3, 'Resolution note is required').max(1000) }),
};

module.exports = { resolveTicketSchema };