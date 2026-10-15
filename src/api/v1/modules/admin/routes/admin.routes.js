const express = require('express');
const userManagementController = require('../controllers/user-management.controller');
const auditLogController = require('../controllers/audit-log.controller');
const {
  createUserByAdminSchema,
  updateUserByAdminSchema,
  userParamSchema,
} = require('../validations/user-management.validation');
const { listAuditLogsSchema } = require('../validations/audit-log.validation');
const { listUsersSchema } = require('../../user/validations/user-management.validation');
const validate = require('../../../middleware/validate');
const authenticate = require('../../../middleware/authenticate');
const authorizeRole = require('../../../middleware/authorizeRole');
const authorizePermission = require('../../../middleware/authorizePermission');

const router = express.Router();

router.use(authenticate);

router.get('/users', authorizeRole('admin', 'subadmin'), authorizePermission('user-mgmt', 'read'), validate(listUsersSchema), userManagementController.listUsers);
router.post('/users', authorizeRole('admin', 'subadmin'), authorizePermission('user-mgmt', 'create'), validate(createUserByAdminSchema), userManagementController.createUser);
router.get('/users/:id', authorizeRole('admin', 'subadmin'), authorizePermission('user-mgmt', 'read'), validate(userParamSchema), userManagementController.getUserById);
router.patch('/users/:id', authorizeRole('admin', 'subadmin'), authorizePermission('user-mgmt', 'update'), validate(updateUserByAdminSchema), userManagementController.updateUser);
router.delete('/users/:id', authorizeRole('admin', 'subadmin'), authorizePermission('user-mgmt', 'delete'), validate(userParamSchema), userManagementController.deleteUser);
router.get('/audit-logs', authorizeRole('admin'), validate(listAuditLogsSchema), auditLogController.listAuditLogs);

module.exports = router;