const { z } = require('zod');

const walletParamSchema = {
  params: z.object({ id: z.string().uuid('Invalid wallet UUID') }),
};

module.exports = { walletParamSchema };