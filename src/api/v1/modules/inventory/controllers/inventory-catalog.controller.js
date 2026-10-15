const inventoryCatalogService = require('../services/inventory-catalog.service');
const { successResponse, createdResponse } = require('../../../common/response');

class InventoryCatalogController {
  async createItem(req, res, next) {
    try {
      const item = await inventoryCatalogService.createItem(req.body, req.user.id, req.ip, req.headers['user-agent']);
      return createdResponse(res, 'Inventory item created successfully', item);
    } catch (err) {
      next(err);
    }
  }

  async updateItem(req, res, next) {
    try {
      const item = await inventoryCatalogService.updateItem(req.params.id, req.body, req.user.id, req.ip, req.headers['user-agent']);
      return successResponse(res, 'Inventory item updated successfully', item);
    } catch (err) {
      next(err);
    }
  }

  async getItemById(req, res, next) {
    try {
      const item = await inventoryCatalogService.getItemById(req.params.id);
      return successResponse(res, 'Inventory item retrieved successfully', item);
    } catch (err) {
      next(err);
    }
  }

  async listItems(req, res, next) {
    try {
      const { rows, pagination } = await inventoryCatalogService.listItems(req.query);
      return successResponse(res, 'Inventory items retrieved successfully', rows, 200, pagination);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new InventoryCatalogController();