const crypto = require('crypto');
const Order = require('../order.model');
const inventoryCatalogService = require('../../inventory/services/inventory-catalog.service');
const inventoryStockService = require('../../inventory/services/inventory-stock.service');
const auditLogService = require('../../admin/services/audit-log.service');
const { ORDER_STATUS } = require('../orders.constants');
const sequelize = require('../../../config/database');

class OrderCreationService {
  async createOrder({ userId, items }, actorId, ipAddress = null, userAgent = null) {
    const transaction = await sequelize.transaction();
    try {
      let totalAmount = 0.0;
      const orderItems = [];
      for (const item of items) {
        const inventoryItem = await inventoryCatalogService.getItemById(item.inventoryId);
        const subtotal = parseFloat((inventoryItem.unitPrice * item.quantity).toFixed(2));
        totalAmount += subtotal;
        orderItems.push({
          inventoryId: inventoryItem.id,
          sku: inventoryItem.sku,
          name: inventoryItem.name,
          unitPrice: inventoryItem.unitPrice,
          quantity: item.quantity,
          subtotal,
        });
      }
      await inventoryStockService.reserveStockForOrder(items, transaction);
      const orderNumber = `ORD-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      const order = await Order.create({
        userId,
        orderNumber,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        status: ORDER_STATUS.PENDING,
        items: orderItems,
      }, { transaction });
      await auditLogService.log({
        actorId,
        action: 'ORDER_CREATE',
        module: 'orders',
        targetId: order.id,
        details: { orderNumber, totalAmount, itemsCount: items.length },
        ipAddress,
        userAgent,
      }, transaction);
      await transaction.commit();
      return order;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
}

module.exports = new OrderCreationService();