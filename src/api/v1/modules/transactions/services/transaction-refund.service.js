const Transaction = require('../transaction.model');
const auditLogService = require('../../admin/services/audit-log.service');
const AppError = require('../../../common/AppError');

class TransactionRefundService {
  async refundTransaction(id, reason, actorId, ipAddress = null, userAgent = null) {
    const transaction = await Transaction.findByPk(id);
    if (!transaction) throw AppError.notFound('Transaction not found', 'TRANSACTION_NOT_FOUND');
    if (transaction.status === 'refunded') throw AppError.badRequest('Transaction has already been refunded', 'ALREADY_REFUNDED');
    if (transaction.type !== 'payment' && transaction.type !== 'withdrawal') {
      throw AppError.badRequest('Only payments and withdrawals can be refunded', 'INVALID_TRANSACTION_TYPE');
    }

    const walletService = require('../../wallets/services/wallet-balance.service');
    const refundResult = await walletService.creditWallet(
      transaction.walletId,
      { amount: transaction.amount, description: `Refund for TX ${transaction.referenceId}: ${reason}` },
      actorId,
      ipAddress,
      userAgent
    );
    transaction.status = 'refunded';
    await transaction.save();
    await auditLogService.log({
      actorId,
      action: 'TRANSACTION_REFUND',
      module: 'transactions',
      targetId: transaction.id,
      details: { originalTx: transaction.referenceId, reason, refundTxId: refundResult.transaction.id },
      ipAddress,
      userAgent,
    });
    return { originalTransaction: transaction, refundTransaction: refundResult.transaction };
  }
}

module.exports = new TransactionRefundService();