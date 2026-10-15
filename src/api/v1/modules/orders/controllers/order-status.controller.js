const orderStatusService = require('../services/order-status.service');
const { successResponse } = require('../../../common/response');

class OrderStatusController {
  async updateOrderStatus(req, res, next) {
    try {
      const order = await orderStatusService.updateOrderStatus(req.params.id, req.body.status, req.user.id, req.ip, req.headers['user-agent']);
      return successResponse(res, 'Order status updated successfully', order);
    } catch (err) {
      next(err);
    }
  }

  async cancelOrder(req, res, next) {
    try {
      const order = await orderStatusService.cancelOrder(req.params.id, req.user.id, req.user, req.ip, req.headers['user-agent']);
      return successResponse(res, 'Order cancelled successfully', order);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new OrderStatusController();