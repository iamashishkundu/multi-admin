const express = require('express');
const settingsQueryController = require('../controllers/settings-query.controller');
const settingsManagementController = require('../controllers/settings-management.controller');
const { settingKeyParamSchema, listSettingsSchema } = require('../validations/settings-query.validation');
const { updateSettingSchema } = require('../validations/settings-management.validation');
const validate = require('../../../middleware/validate');
const authenticate = require('../../../middleware/authenticate');
const authorizePermission = require('../../../middleware/authorizePermission');

const router = express.Router();
router.use(authenticate);

router.get('/', (req, res, next) => {
  if (req.user.role === 'user') return next();
  return authorizePermission('settings', 'read')(req, res, next);
}, validate(listSettingsSchema), settingsQueryController.listSettings);
router.get('/:key', (req, res, next) => {
  if (req.user.role === 'user') return next();
  return authorizePermission('settings', 'read')(req, res, next);
}, validate(settingKeyParamSchema), settingsQueryController.getSettingByKey);
router.patch('/:key', authorizePermission('settings', 'manage'), validate(updateSettingSchema), settingsManagementController.updateSetting);

module.exports = router;