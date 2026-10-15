const { Op } = require('sequelize');
const Notification = require('../notification.model');
const { formatPaginatedResponse } = require('../../../common/pagination');

class NotificationQueryService {
  async listNotifications(query, requestingUser) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
    const where = {};
    if (requestingUser.role === 'user') {
      where[Op.or] = [{ userId: requestingUser.id }, { isBroadcast: true }];
    }
    if (query.type) where.type = query.type;
    if (query.isRead !== undefined) where.isRead = query.isRead === 'true' || query.isRead === true;
    const { count, rows } = await Notification.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']],
    });
    return formatPaginatedResponse(rows, count, page, limit);
  }
}

module.exports = new NotificationQueryService();