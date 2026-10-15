const Inventory = require('../inventory.model');
const auditLogService = require('../../admin/services/audit-log.service');
const AppError = require('../../../common/AppError');
const sequelize = require('../../../config/database');

class InventoryStockService {
  async adjustStock(id, { adjustmentQuantity, reason }, actorId, ipAddress = null, userAgent = null) {
    const transaction = await sequelize.transaction();
    try {
      const item = await Inventory.findByPk(id, { lock: transaction.LOCK.UPDATE, transaction });
      if (!item) throw AppError.notFound('Inventory item not found', 'ITEM_NOT_FOUND');
      const newQuantity = item.stockQuantity + adjustmentQuantity;
      if (newQuantity < 0) throw AppError.badRequest(`Adjustment of ${adjustmentQuantity} would result in negative stock (current: ${item.stockQuantity})`, 'INSUFFICIENT_STOCK');
      item.stockQuantity = newQuantity;
      await item.save({ transaction });
      await auditLogService.log({ actorId, action: 'INVENTORY_ADJUST_STOCK', module: 'inventory', targetId: item.id,
        details: { adjustmentQuantity, newQuantity, reason }, ipAddress, userAgent }, transaction);
      await transaction.commit();
      return item;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async reserveStockForOrder(items, transaction) {
    for (const item of items) {
      const inventoryItem = await Inventory.findByPk(item.inventoryId, { lock: transaction.LOCK.UPDATE, transaction });
      if (!inventoryItem) throw AppError.notFound(`Inventory item [${item.inventoryId}] not found`, 'ITEM_NOT_FOUND');
      if (inventoryItem.stockQuantity < item.quantity) throw AppError.badRequest(`Insufficient stock for item '${inventoryItem.name}'. Available: ${inventoryItem.stockQuantity}, Requested: ${item.quantity}`, 'INSUFFICIENT_STOCK');
      inventoryItem.stockQuantity -= item.quantity;
      inventoryItem.reservedQuantity += item.quantity;
      await inventoryItem.save({ transaction });
    }
  }

  async releaseStockForOrder(items, transaction) {
    for (const item of items) {
      const inventoryItem = await Inventory.findByPk(item.inventoryId, { lock: transaction.LOCK.UPDATE, transaction });
      if (inventoryItem) {
        inventoryItem.stockQuantity += item.quantity;
        inventoryItem.reservedQuantity = Math.max(0, inventoryItem.reservedQuantity - item.quantity);
        await inventoryItem.save({ transaction });
      }
    }
  }
}

module.exports = new InventoryStockService();