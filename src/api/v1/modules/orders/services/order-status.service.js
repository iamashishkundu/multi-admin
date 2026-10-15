const Order = require('../order.model');
const inventoryStockService = require('../../inventory/services/inventory-stock.service');
const auditLogService = require('../../admin/services/audit-log.service');
const { ORDER_STATUS, VALID_STATUS_TRANSITIONS } = require('../orders.constants');
const AppError = require('../../../common/AppError');
const sequelize = require('../../../config/database');

class OrderStatusService {
  async updateOrderStatus(id, newStatus, actorId, ipAddress = null, userAgent = null) {
    const transaction = await sequelize.transaction();
    try {
      const order = await Order.findByPk(id, { transaction });
      if (!order) throw AppError.notFound('Order not found', 'ORDER_NOT_FOUND');
      if (order.status === newStatus) {
        await transaction.rollback();
        return order;
      }
      const allowedTransitions = VALID_STATUS_TRANSITIONS[order.status] || [];
      if (!allowedTransitions.includes(newStatus)) throw AppError.badRequest(`Cannot transition order from status '${order.status}' to '${newStatus}'`, 'INVALID_STATUS_TRANSITION');
      const previousStatus = order.status;
      order.status = newStatus;
      await order.save({ transaction });
      if (newStatus === ORDER_STATUS.CANCELLED) await inventoryStockService.releaseStockForOrder(order.items, transaction);
      await auditLogService.log({ actorId, action: 'ORDER_UPDATE_STATUS', module: 'orders', targetId: order.id,
        details: { previousStatus, newStatus }, ipAddress, userAgent }, transaction);
      await transaction.commit();
      return order;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async cancelOrder(id, actorId, requestingUser, ipAddress = null, userAgent = null) {
    const transaction = await sequelize.transaction();
    try {
      const order = await Order.findByPk(id, { transaction });
      if (!order) throw AppError.notFound('Order not found', 'ORDER_NOT_FOUND');
      if (requestingUser.role === 'user' && order.userId !== requestingUser.id) throw AppError.forbidden('You can only cancel your own orders', 'FORBIDDEN');
      if (order.status === ORDER_STATUS.CANCELLED) throw AppError.badRequest('Order is already cancelled', 'ALREADY_CANCELLED');
      if (order.status === ORDER_STATUS.COMPLETED) throw AppError.badRequest('Completed orders cannot be cancelled', 'INVALID_OPERATION');
      order.status = ORDER_STATUS.CANCELLED;
      await order.save({ transaction });
      await inventoryStockService.releaseStockForOrder(order.items, transaction);
      await auditLogService.log({ actorId, action: 'ORDER_CANCEL', module: 'orders', targetId: order.id,
        details: { orderNumber: order.orderNumber }, ipAddress, userAgent }, transaction);
      await transaction.commit();
      return order;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
}

module.exports = new OrderStatusService();