const express = require('express');
const permissionCatalogController = require('../controllers/permission-catalog.controller');
const permissionQueryController = require('../controllers/permission-query.controller');
const permissionAssignmentController = require('../controllers/permission-assignment.controller');
const { getSubadminPermissionsSchema } = require('../validations/permission-query.validation');
const { assignPermissionsSchema, revokePermissionsSchema } = require('../validations/permission-assignment.validation');
const validate = require('../../../middleware/validate');
const authenticate = require('../../../middleware/authenticate');
const authorizeRole = require('../../../middleware/authorizeRole');

const router = express.Router();
router.use(authenticate);

router.get('/modules', authorizeRole('admin'), permissionCatalogController.getModules);
router.get('/subadmin/:id', authorizeRole('admin', 'subadmin'), validate(getSubadminPermissionsSchema), permissionQueryController.getSubadminPermissions);
router.post('/assign', authorizeRole('admin'), validate(assignPermissionsSchema), permissionAssignmentController.assignPermissions);
router.post('/revoke', authorizeRole('admin'), validate(revokePermissionsSchema), permissionAssignmentController.revokePermissions);

module.exports = router;