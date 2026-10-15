const AuditLog = require('../models/audit-log.model');
const { formatPaginatedResponse } = require('../../../common/pagination');

class AuditLogService {
  async log({ actorId, action, module, targetId = null, details = null, ipAddress = null, userAgent = null }, transaction = null) {
    try {
      return await AuditLog.create({
        actorId,
        action,
        module,
        targetId: targetId ? String(targetId) : null,
        details,
        ipAddress,
        userAgent,
      }, { transaction });
    } catch (err) {
      console.error('Failed to write audit log:', err.message);
    }
  }

  async listAuditLogs({ page = 1, limit = 20, module, actorId, action, sortBy = 'createdAt', sortOrder = 'DESC' }) {
    const where = {};
    if (module) where.module = module;
    if (actorId) where.actorId = actorId;
    if (action) where.action = action;
    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [[sortBy, sortOrder.toUpperCase()]],
    });
    return formatPaginatedResponse(rows, count, page, limit);
  }
}

module.exports = new AuditLogService();