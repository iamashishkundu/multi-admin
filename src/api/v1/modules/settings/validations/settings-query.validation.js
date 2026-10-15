const { z } = require('zod');

const settingKeyParamSchema = {
  params: z.object({ key: z.string().min(1, 'Setting key is required') }),
};

const listSettingsSchema = {
  query: z.object({ isPublic: z.enum(['true', 'false']).optional() }),
};

module.exports = { settingKeyParamSchema, listSettingsSchema };