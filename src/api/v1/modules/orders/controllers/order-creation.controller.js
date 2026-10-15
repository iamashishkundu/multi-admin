const orderCreationService = require('../services/order-creation.service');
const { createdResponse } = require('../../../common/response');

class OrderCreationController {
  async createOrder(req, res, next) {
    try {
      const order = await orderCreationService.createOrder({ userId: req.user.id, items: req.body.items }, req.user.id, req.ip, req.headers['user-agent']);
      return createdResponse(res, 'Order created successfully', order);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new OrderCreationController();