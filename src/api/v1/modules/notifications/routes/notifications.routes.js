const express = require('express');
const notificationManagementController = require('../controllers/notification-management.controller');
const notificationQueryController = require('../controllers/notification-query.controller');
const notificationReadController = require('../controllers/notification-read.controller');
const { createNotificationSchema, sendNotificationSchema } = require('../validations/notification-management.validation');
const { listNotificationsSchema } = require('../validations/notification-query.validation');
const { notificationParamSchema } = require('../validations/notification-read.validation');
const validate = require('../../../middleware/validate');
const authenticate = require('../../../middleware/authenticate');
const authorizePermission = require('../../../middleware/authorizePermission');

const router = express.Router();
router.use(authenticate);

router.get('/', (req, res, next) => {
  if (req.user.role === 'user') return next();
  return authorizePermission('notifications', 'read')(req, res, next);
}, validate(listNotificationsSchema), notificationQueryController.listNotifications);
router.post('/', authorizePermission('notifications', 'create'), validate(createNotificationSchema), notificationManagementController.createNotification);
router.post('/send', authorizePermission('notifications', 'send'), validate(sendNotificationSchema), notificationManagementController.sendNotification);
router.patch('/:id/read', validate(notificationParamSchema), notificationReadController.markAsRead);

module.exports = router;