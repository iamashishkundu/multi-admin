const transactionRefundService = require('../services/transaction-refund.service');
const { successResponse } = require('../../../common/response');

class TransactionRefundController {
  async refundTransaction(req, res, next) {
    try {
      const result = await transactionRefundService.refundTransaction(req.params.id, req.body.reason, req.user.id, req.ip, req.headers['user-agent']);
      return successResponse(res, 'Transaction refunded successfully', result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TransactionRefundController();