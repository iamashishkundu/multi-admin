const userAccountService = require('../../user/services/user-account.service');
const userCredentialsService = require('../../user/services/user-credentials.service');
const auditLogService = require('../../admin/services/audit-log.service');
const AppError = require('../../../common/AppError');

class SubAdminStatusService {
  async deactivateSubAdmin(id, adminId, ipAddress = null, userAgent = null) {
    const existing = await userAccountService.findById(id);
    if (existing.role !== 'subadmin') throw AppError.badRequest('Target user is not a sub-admin', 'INVALID_TARGET_USER');
    const updated = await userAccountService.updateUser(id, { isActive: false });
    await userCredentialsService.incrementTokenVersion(id);
    await auditLogService.log({
      actorId: adminId,
      action: 'DEACTIVATE_SUBADMIN',
      module: 'subadmin-mgmt',
      targetId: id,
      details: { isActive: false },
      ipAddress,
      userAgent,
    });
    return updated;
  }
}

module.exports = new SubAdminStatusService();