const { z } = require('zod');

const assignTicketSchema = {
  params: z.object({ id: z.string().uuid('Invalid ticket UUID') }),
  body: z.object({ assignedToId: z.string().uuid('Invalid staff UUID') }),
};

module.exports = { assignTicketSchema };