const { z } = require('zod');

const permissionAssignmentItem = z.object({
  module: z.string().min(1, 'Module key is required'),
  actions: z.array(z.string().min(1)).min(1, 'At least one action must be specified'),
});

const assignPermissionsSchema = {
  body: z.object({
    subadminId: z.string().uuid('Invalid subadmin UUID'),
    permissions: z.array(permissionAssignmentItem).min(1, 'Permissions array cannot be empty'),
  }),
};

const revokePermissionsSchema = {
  body: z.object({
    subadminId: z.string().uuid('Invalid subadmin UUID'),
    permissions: z.array(permissionAssignmentItem).min(1, 'Permissions array cannot be empty'),
  }),
};

module.exports = { assignPermissionsSchema, revokePermissionsSchema };