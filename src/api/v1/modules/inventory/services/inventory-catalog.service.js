const { Op } = require('sequelize');
const Inventory = require('../inventory.model');
const auditLogService = require('../../admin/services/audit-log.service');
const AppError = require('../../../common/AppError');
const { formatPaginatedResponse } = require('../../../common/pagination');

class InventoryCatalogService {
  async createItem(data, actorId, ipAddress = null, userAgent = null) {
    const existing = await Inventory.findOne({ where: { sku: data.sku.toUpperCase() } });
    if (existing) throw AppError.conflict(`Inventory item with SKU '${data.sku}' already exists`, 'SKU_ALREADY_EXISTS');
    const item = await Inventory.create({
      sku: data.sku.toUpperCase(), name: data.name, stockQuantity: data.stockQuantity || 0,
      reservedQuantity: 0, unitPrice: data.unitPrice,
    });
    await auditLogService.log({ actorId, action: 'INVENTORY_CREATE', module: 'inventory', targetId: item.id,
      details: { sku: item.sku, stock: item.stockQuantity }, ipAddress, userAgent });
    return item;
  }

  async updateItem(id, data, actorId, ipAddress = null, userAgent = null) {
    const item = await Inventory.findByPk(id);
    if (!item) throw AppError.notFound('Inventory item not found', 'ITEM_NOT_FOUND');
    if (data.name) item.name = data.name;
    if (data.unitPrice !== undefined) item.unitPrice = data.unitPrice;
    if (data.stockQuantity !== undefined) item.stockQuantity = data.stockQuantity;
    await item.save();
    await auditLogService.log({ actorId, action: 'INVENTORY_UPDATE', module: 'inventory', targetId: item.id,
      details: data, ipAddress, userAgent });
    return item;
  }

  async getItemById(id) {
    const item = await Inventory.findByPk(id);
    if (!item) throw AppError.notFound('Inventory item not found', 'ITEM_NOT_FOUND');
    return item;
  }

  async listItems(query) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
    const where = {};
    if (query.search) where[Op.or] = [
      { name: { [Op.iLike]: `%${query.search}%` } },
      { sku: { [Op.iLike]: `%${query.search}%` } },
    ];
    const { count, rows } = await Inventory.findAndCountAll({
      where, limit, offset: (page - 1) * limit,
      order: [[query.sortBy || 'createdAt', (query.sortOrder || 'DESC').toUpperCase()]],
    });
    return formatPaginatedResponse(rows, count, page, limit);
  }
}

module.exports = new InventoryCatalogService();