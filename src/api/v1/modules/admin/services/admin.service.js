const userAccountService = require('../../user/services/user-account.service');
const userListService = require('../../user/services/user-list.service');
const auditLogService = require('./audit-log.service');

class AdminService {
  async createUser(userData, actorId, ipAddress = null, userAgent = null) {
    const user = await userAccountService.createUser(userData);
    await auditLogService.log({
      actorId,
      action: 'CREATE_USER',
      module: 'user-mgmt',
      targetId: user.id,
      details: { email: user.email, role: user.role },
      ipAddress,
      userAgent,
    });
    return user;
  }

  async updateUser(id, updateData, actorId, ipAddress = null, userAgent = null) {
    const user = await userAccountService.updateUser(id, updateData);
    await auditLogService.log({
      actorId,
      action: 'UPDATE_USER',
      module: 'user-mgmt',
      targetId: id,
      details: updateData,
      ipAddress,
      userAgent,
    });
    return user;
  }

  async deleteUser(id, actorId, ipAddress = null, userAgent = null) {
    await userAccountService.deleteUser(id);
    await auditLogService.log({
      actorId,
      action: 'DELETE_USER',
      module: 'user-mgmt',
      targetId: id,
      details: null,
      ipAddress,
      userAgent,
    });
    return true;
  }

  async getUserById(id) {
    return userAccountService.findById(id);
  }

  async listUsers(query) {
    return userListService.listUsers(query);
  }
}

module.exports = new AdminService();