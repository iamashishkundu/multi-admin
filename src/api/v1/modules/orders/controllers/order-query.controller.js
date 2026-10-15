const orderQueryService = require('../services/order-query.service');
const { successResponse } = require('../../../common/response');

class OrderQueryController {
  async listOrders(req, res, next) {
    try {
      const { rows, pagination } = await orderQueryService.listOrders(req.query, req.user);
      return successResponse(res, 'Orders retrieved successfully', rows, 200, pagination);
    } catch (err) {
      next(err);
    }
  }

  async getOrderById(req, res, next) {
    try {
      const order = await orderQueryService.getOrderById(req.params.id, req.user);
      return successResponse(res, 'Order retrieved successfully', order);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new OrderQueryController();