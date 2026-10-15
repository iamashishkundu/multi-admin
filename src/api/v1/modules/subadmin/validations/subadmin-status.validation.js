const { z } = require('zod');

const subadminParamSchema = {
  params: z.object({ id: z.string().uuid('Invalid subadmin UUID') }),
};

module.exports = { subadminParamSchema };