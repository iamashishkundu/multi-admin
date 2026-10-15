const Order = require('../order.model');
const AppError = require('../../../common/AppError');
const { formatPaginatedResponse } = require('../../../common/pagination');

class OrderQueryService {
  async listOrders(query, requestingUser) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
    const where = {};
    if (requestingUser.role === 'user') where.userId = requestingUser.id;
    else if (query.userId) where.userId = query.userId;
    if (query.status) where.status = query.status;
    const { count, rows } = await Order.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [[query.sortBy || 'createdAt', (query.sortOrder || 'DESC').toUpperCase()]],
    });
    return formatPaginatedResponse(rows, count, page, limit);
  }

  async getOrderById(id, requestingUser) {
    const order = await Order.findByPk(id);
    if (!order) throw AppError.notFound('Order not found', 'ORDER_NOT_FOUND');
    if (requestingUser.role === 'user' && order.userId !== requestingUser.id) {
      throw AppError.forbidden('Access denied to requested order', 'FORBIDDEN');
    }
    return order;
  }
}

module.exports = new OrderQueryService();