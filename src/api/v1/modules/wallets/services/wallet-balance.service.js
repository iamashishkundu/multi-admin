const Wallet = require('../wallet.model');
const transactionLedgerService = require('../../transactions/services/transaction-ledger.service');
const auditLogService = require('../../admin/services/audit-log.service');
const AppError = require('../../../common/AppError');
const sequelize = require('../../../config/database');

class WalletBalanceService {
  async creditWallet(walletId, { amount, description, referenceId }, actorId, ipAddress = null, userAgent = null) {
    return this.mutateWallet(walletId, parseFloat(amount), 'deposit', description, referenceId, actorId, ipAddress, userAgent, 'WALLET_CREDIT');
  }

  async debitWallet(walletId, { amount, description, referenceId }, actorId, ipAddress = null, userAgent = null) {
    return this.mutateWallet(walletId, -parseFloat(amount), 'withdrawal', description, referenceId, actorId, ipAddress, userAgent, 'WALLET_DEBIT', true);
  }

  async adjustWallet(walletId, { amount, reason, referenceId }, actorId, ipAddress = null, userAgent = null) {
    return this.mutateWallet(walletId, parseFloat(amount), 'adjustment', `Manual adjustment: ${reason}`, referenceId, actorId, ipAddress, userAgent, 'WALLET_ADJUST', false, reason);
  }

  async mutateWallet(walletId, delta, type, description, referenceId, actorId, ipAddress, userAgent, auditAction, requireFunds = false, reason = null) {
    const transaction = await sequelize.transaction();
    try {
      const wallet = await Wallet.findByPk(walletId, { lock: transaction.LOCK.UPDATE, transaction });
      if (!wallet) throw AppError.notFound('Wallet not found', 'WALLET_NOT_FOUND');
      if (!wallet.isActive) throw AppError.badRequest('Wallet is inactive', 'WALLET_INACTIVE');
      if (requireFunds && wallet.balance < Math.abs(delta)) {
        throw AppError.badRequest(`Insufficient funds: current balance is ${wallet.balance}, requested debit is ${Math.abs(delta)}`, 'INSUFFICIENT_FUNDS');
      }
      const newBalance = parseFloat((wallet.balance + delta).toFixed(2));
      if (newBalance < 0) throw AppError.badRequest(`Invalid balance: adjustment would result in negative balance (${newBalance})`, 'INVALID_BALANCE');
      wallet.balance = newBalance;
      await wallet.save({ transaction });
      const txRecord = await transactionLedgerService.recordTransaction({
        userId: wallet.userId,
        walletId: wallet.id,
        type,
        amount: type === 'adjustment' ? Math.abs(delta) : Math.abs(delta),
        status: 'completed',
        description,
        referenceId,
        ...(type === 'adjustment' ? { metadata: { adjustedBy: actorId, adjustmentDelta: delta } } : {}),
      }, transaction);
      await auditLogService.log({
        actorId,
        action: auditAction,
        module: 'wallet',
        targetId: wallet.id,
        details: type === 'adjustment' ? { adjustAmount: delta, newBalance, reason } : { amount: Math.abs(delta), newBalance, transactionId: txRecord.id },
        ipAddress,
        userAgent,
      }, transaction);
      await transaction.commit();
      return { wallet, transaction: txRecord };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
}

module.exports = new WalletBalanceService();