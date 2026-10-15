const { z } = require('zod');

const createSubAdminSchema = {
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
  }),
};

const updateSubAdminSchema = {
  params: z.object({ id: z.string().uuid('Invalid subadmin UUID') }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().optional(),
    isActive: z.boolean().optional(),
    password: z.string().min(8).optional(),
  }),
};

const listSubAdminSchema = {
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    isActive: z.enum(['true', 'false']).optional(),
    search: z.string().optional(),
  }),
};

module.exports = { createSubAdminSchema, updateSubAdminSchema, listSubAdminSchema };