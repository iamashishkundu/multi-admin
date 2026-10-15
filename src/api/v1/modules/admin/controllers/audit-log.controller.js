const auditLogService = require('../services/audit-log.service');
const { successResponse } = require('../../../common/response');

class AuditLogController {
  async listAuditLogs(req, res, next) {
    try {
      const { rows, pagination } = await auditLogService.listAuditLogs(req.query);
      return successResponse(res, 'Audit logs retrieved successfully', rows, 200, pagination);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuditLogController();