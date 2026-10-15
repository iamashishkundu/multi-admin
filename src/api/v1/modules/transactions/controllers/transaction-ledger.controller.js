const transactionLedgerService = require('../services/transaction-ledger.service');
const { successResponse } = require('../../../common/response');

class TransactionLedgerController {
  async listTransactions(req, res, next) {
    try {
      const { rows, pagination } = await transactionLedgerService.listTransactions(req.query, req.user);
      return successResponse(res, 'Transactions retrieved successfully', rows, 200, pagination);
    } catch (err) {
      next(err);
    }
  }

  async getTransactionById(req, res, next) {
    try {
      const transaction = await transactionLedgerService.getTransactionById(req.params.id, req.user);
      return successResponse(res, 'Transaction retrieved successfully', transaction);
    } catch (err) {
      next(err);
    }
  }

  async exportTransactions(req, res, next) {
    try {
      const transactions = await transactionLedgerService.exportTransactions(req.body);
      return successResponse(res, 'Transactions exported successfully', transactions);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TransactionLedgerController();