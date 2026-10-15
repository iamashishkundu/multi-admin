const Notification = require('../notification.model');
const AppError = require('../../../common/AppError');

class NotificationReadService {
  async markAsRead(id, requestingUser) {
    const notification = await Notification.findByPk(id);
    if (!notification) throw AppError.notFound('Notification not found', 'NOTIFICATION_NOT_FOUND');
    if (requestingUser.role === 'user' && notification.userId && notification.userId !== requestingUser.id) {
      throw AppError.forbidden('Access denied', 'FORBIDDEN');
    }
    notification.isRead = true;
    await notification.save();
    return notification;
  }
}

module.exports = new NotificationReadService();