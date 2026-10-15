const crypto = require('crypto');
const { Op } = require('sequelize');
const Transaction = require('../transaction.model');
const AppError = require('../../../common/AppError');
const { formatPaginatedResponse } = require('../../../common/pagination');

class TransactionLedgerService {
  async recordTransaction(
    { userId, walletId, type, amount, status = 'completed', description, referenceId = null, metadata = null },
    transaction = null
  ) {
    const finalReferenceId = referenceId || `TX-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    return Transaction.create({ userId, walletId, referenceId: finalReferenceId, type, amount, status, description, metadata }, { transaction });
  }

  async listTransactions(query, requestingUser) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
    const where = {};
    if (requestingUser.role === 'user') where.userId = requestingUser.id;
    else if (query.userId) where.userId = query.userId;
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;
    const { count, rows } = await Transaction.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [[query.sortBy || 'createdAt', (query.sortOrder || 'DESC').toUpperCase()]],
    });
    return formatPaginatedResponse(rows, count, page, limit);
  }

  async getTransactionById(id, requestingUser) {
    const transaction = await Transaction.findByPk(id);
    if (!transaction) throw AppError.notFound('Transaction not found', 'TRANSACTION_NOT_FOUND');
    if (requestingUser.role === 'user' && transaction.userId !== requestingUser.id) {
      throw AppError.forbidden('Access denied to requested transaction', 'FORBIDDEN');
    }
    return transaction;
  }

  async exportTransactions(filters) {
    const where = {};
    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt[Op.gte] = new Date(filters.startDate);
      if (filters.endDate) where.createdAt[Op.lte] = new Date(filters.endDate);
    }
    return Transaction.findAll({ where, order: [['createdAt', 'DESC']], limit: 1000 });
  }
}

module.exports = new TransactionLedgerService();