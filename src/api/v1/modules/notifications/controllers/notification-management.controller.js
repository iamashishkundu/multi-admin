const notificationManagementService = require('../services/notification-management.service');
const { successResponse, createdResponse } = require('../../../common/response');

class NotificationManagementController {
  async createNotification(req, res, next) {
    try {
      const notification = await notificationManagementService.createNotification(req.body, req.user.id);
      return createdResponse(res, 'Notification created successfully', notification);
    } catch (err) {
      next(err);
    }
  }

  async sendNotification(req, res, next) {
    try {
      const notification = await notificationManagementService.sendNotification(req.body, req.user.id, req.ip, req.headers['user-agent']);
      return successResponse(res, 'Notification sent successfully', notification);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NotificationManagementController();