const { z } = require('zod');
const { ROLES } = require('../user.constants');

const createUserSchema = {
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    role: z.enum([ROLES.USER, ROLES.SUBADMIN]).default(ROLES.USER),
    isActive: z.boolean().default(true),
  }),
};

const updateUserSchema = {
  params: z.object({ id: z.string().uuid('Invalid user UUID') }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().optional(),
    isActive: z.boolean().optional(),
    password: z.string().min(8).optional(),
  }),
};

const getUserByIdSchema = {
  params: z.object({ id: z.string().uuid('Invalid user UUID') }),
};

const listUsersSchema = {
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    role: z.enum([ROLES.USER, ROLES.ADMIN, ROLES.SUBADMIN]).optional(),
    isActive: z.enum(['true', 'false']).optional(),
    search: z.string().optional(),
    sortBy: z.enum(['createdAt', 'name', 'email']).optional(),
    sortOrder: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional(),
  }),
};

module.exports = {
  createUserSchema,
  updateUserSchema,
  getUserByIdSchema,
  listUsersSchema,
};