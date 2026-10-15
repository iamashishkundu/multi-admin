const { z } = require('zod');

const updateProfileSchema = {
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8, 'New password must be at least 8 characters').optional(),
  }).refine((data) => {
    if (data.newPassword && !data.currentPassword) return false;
    return true;
  }, {
    message: 'Current password is required to set a new password',
    path: ['currentPassword'],
  }),
};

module.exports = { updateProfileSchema };