const inventoryStockService = require('../services/inventory-stock.service');
const { successResponse } = require('../../../common/response');

class InventoryStockController {
  async adjustStock(req, res, next) {
    try {
      const item = await inventoryStockService.adjustStock(req.params.id, req.body, req.user.id, req.ip, req.headers['user-agent']);
      return successResponse(res, 'Stock adjusted successfully', item);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new InventoryStockController();