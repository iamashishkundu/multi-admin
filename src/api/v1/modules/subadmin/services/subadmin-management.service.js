const userAccountService = require('../../user/services/user-account.service');
const userListService = require('../../user/services/user-list.service');
const auditLogService = require('../../admin/services/audit-log.service');
const AppError = require('../../../common/AppError');

class SubAdminManagementService {
  async createSubAdmin({ name, email, password }, adminId, ipAddress = null, userAgent = null) {
    const subadmin = await userAccountService.createUser({ name, email, password, role: 'subadmin', isActive: true });
    await auditLogService.log({
      actorId: adminId,
      action: 'CREATE_SUBADMIN',
      module: 'subadmin-mgmt',
      targetId: subadmin.id,
      details: { email: subadmin.email, name: subadmin.name },
      ipAddress,
      userAgent,
    });
    return subadmin;
  }

  async updateSubAdmin(id, updateData, adminId, ipAddress = null, userAgent = null) {
    const existing = await userAccountService.findById(id);
    if (existing.role !== 'subadmin') throw AppError.badRequest('Target user is not a sub-admin', 'INVALID_TARGET_USER');
    const updated = await userAccountService.updateUser(id, updateData);
    await auditLogService.log({
      actorId: adminId,
      action: 'UPDATE_SUBADMIN',
      module: 'subadmin-mgmt',
      targetId: id,
      details: updateData,
      ipAddress,
      userAgent,
    });
    return updated;
  }

  async getSubAdminById(id) {
    const user = await userAccountService.findById(id);
    if (user.role !== 'subadmin') throw AppError.notFound('Sub-admin not found', 'SUBADMIN_NOT_FOUND');
    return user;
  }

  async listSubAdmins(query) {
    return userListService.listUsers({ ...query, role: 'subadmin' });
  }
}

module.exports = new SubAdminManagementService();