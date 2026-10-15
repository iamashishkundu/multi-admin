const { z } = require('zod');

const getSubadminPermissionsSchema = {
  params: z.object({ id: z.string().uuid('Invalid subadmin UUID') }),
};

module.exports = { getSubadminPermissionsSchema };