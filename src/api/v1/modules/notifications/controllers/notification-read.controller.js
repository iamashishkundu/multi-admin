const notificationReadService = require('../services/notification-read.service');
const { successResponse } = require('../../../common/response');

class NotificationReadController {
  async markAsRead(req, res, next) {
    try {
      const notification = await notificationReadService.markAsRead(req.params.id, req.user);
      return successResponse(res, 'Notification marked as read', notification);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NotificationReadController();