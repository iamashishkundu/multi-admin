const express = require('express');
const subAdminManagementController = require('../controllers/subadmin-management.controller');
const subAdminStatusController = require('../controllers/subadmin-status.controller');
const {
  createSubAdminSchema,
  updateSubAdminSchema,
  listSubAdminSchema,
} = require('../validations/subadmin-management.validation');
const { subadminParamSchema } = require('../validations/subadmin-status.validation');
const validate = require('../../../middleware/validate');
const authenticate = require('../../../middleware/authenticate');
const authorizeRole = require('../../../middleware/authorizeRole');

const router = express.Router();

router.use(authenticate, authorizeRole('admin'));

router.get('/', validate(listSubAdminSchema), subAdminManagementController.listSubAdmins);
router.post('/', validate(createSubAdminSchema), subAdminManagementController.createSubAdmin);
router.get('/:id', validate(subadminParamSchema), subAdminManagementController.getSubAdminById);
router.patch('/:id', validate(updateSubAdminSchema), subAdminManagementController.updateSubAdmin);
router.delete('/:id', validate(subadminParamSchema), subAdminStatusController.deactivateSubAdmin);

module.exports = router;