const { z } = require('zod');

const updateSettingSchema = {
  params: z.object({ key: z.string().min(1, 'Setting key is required') }),
  body: z.object({
    value: z.any(),
    description: z.string().optional(),
    isPublic: z.boolean().optional(),
  }),
};

module.exports = { updateSettingSchema };