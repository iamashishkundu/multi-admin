const { z } = require('zod');

const ticketParamSchema = { params: z.object({ id: z.string().uuid('Invalid ticket UUID') }) };
const createTicketSchema = {
  body: z.object({
    subject: z.string().min(3, 'Subject must be at least 3 characters').max(255),
    description: z.string().min(5, 'Description must be at least 5 characters'),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
  }),
};
const listTicketsSchema = {
  query: z.object({
    page: z.string().optional(), limit: z.string().optional(),
    status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(), userId: z.string().uuid().optional(),
  }),
};

module.exports = { ticketParamSchema, createTicketSchema, listTicketsSchema };