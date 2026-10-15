const { z } = require('zod');

const createUserByAdminSchema = {
  body: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['user', 'subadmin']).default('user'),
    isActive: z.boolean().default(true),
  }),
};

const updateUserByAdminSchema = {
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().optional(),
    isActive: z.boolean().optional(),
    password: z.string().min(8).optional(),
  }),
};

const userParamSchema = {
  params: z.object({ id: z.string().uuid() }),
};

module.exports = { createUserByAdminSchema, updateUserByAdminSchema, userParamSchema };