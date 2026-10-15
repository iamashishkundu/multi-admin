const notificationQueryService = require('../services/notification-query.service');
const { successResponse } = require('../../../common/response');

class NotificationQueryController {
  async listNotifications(req, res, next) {
    try {
      const { rows, pagination } = await notificationQueryService.listNotifications(req.query, req.user);
      return successResponse(res, 'Notifications retrieved successfully', rows, 200, pagination);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NotificationQueryController();