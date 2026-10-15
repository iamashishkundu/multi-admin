const { z } = require('zod');

const faqParamSchema = { params: z.object({ id: z.string().uuid('Invalid FAQ UUID') }) };

const createFaqSchema = {
  body: z.object({
    question: z.string().min(5, 'Question must be at least 5 characters'),
    answer: z.string().min(5, 'Answer must be at least 5 characters'),
    category: z.string().default('general'),
    isPublished: z.boolean().default(false),
  }),
};

const updateFaqSchema = {
  params: z.object({ id: z.string().uuid('Invalid FAQ UUID') }),
  body: z.object({
    question: z.string().min(5).optional(),
    answer: z.string().min(5).optional(),
    category: z.string().optional(),
    isPublished: z.boolean().optional(),
  }),
};

module.exports = { faqParamSchema, createFaqSchema, updateFaqSchema };