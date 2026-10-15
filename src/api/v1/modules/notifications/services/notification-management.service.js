const Notification = require('../notification.model');
const auditLogService = require('../../admin/services/audit-log.service');

class NotificationManagementService {
  async createNotification(data, actorId) {
    return Notification.create({
      title: data.title,
      message: data.message,
      type: data.type || 'general',
      userId: data.userId || null,
      isBroadcast: data.isBroadcast || false,
    });
  }

  async sendNotification(data, actorId, ipAddress = null, userAgent = null) {
    const notification = await Notification.create({
      title: data.title,
      message: data.message,
      type: data.type || 'general',
      userId: data.userId || null,
      isBroadcast: data.isBroadcast || false,
    });
    await auditLogService.log({
      actorId,
      action: 'NOTIFICATION_SEND',
      module: 'notifications',
      targetId: notification.id,
      details: { title: notification.title, isBroadcast: notification.isBroadcast, targetUserId: notification.userId },
      ipAddress,
      userAgent,
    });
    return notification;
  }
}

module.exports = new NotificationManagementService();