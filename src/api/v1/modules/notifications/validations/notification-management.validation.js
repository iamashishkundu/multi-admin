const { z } = require('zod');

const createNotificationSchema = {
  body: z.object({
    title: z.string().min(2, 'Title is required').max(255),
    message: z.string().min(2, 'Message is required'),
    type: z.enum(['system', 'order', 'wallet', 'general']).default('general'),
    userId: z.string().uuid().optional(),
    isBroadcast: z.boolean().default(false),
  }),
};

const sendNotificationSchema = {
  body: z.object({
    title: z.string().min(2).max(255),
    message: z.string().min(2),
    type: z.enum(['system', 'order', 'wallet', 'general']).default('general'),
    userId: z.string().uuid().optional(),
    isBroadcast: z.boolean().default(false),
  }),
};

module.exports = { createNotificationSchema, sendNotificationSchema };