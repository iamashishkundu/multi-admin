const ModuleModel = require('../module.model');
const Permission = require('../permission.model');
const SubAdminPermission = require('../subadmin-permission.model');
const userAccountService = require('../../user/services/user-account.service');
const auditLogService = require('../../admin/services/audit-log.service');
const permissionQueryService = require('./permission-query.service');
const AppError = require('../../../common/AppError');
const sequelize = require('../../../config/database');

class PermissionAssignmentService {
  async assignPermissions({ subadminId, permissions, assignedById, ipAddress = null, userAgent = null }) {
    const subadmin = await userAccountService.findById(subadminId);
    if (subadmin.role !== 'subadmin') {
      throw AppError.badRequest('Permissions can only be assigned to sub-admin accounts', 'INVALID_TARGET_ROLE');
    }

    const transaction = await sequelize.transaction();
    try {
      const assigned = [];
      for (const item of permissions) {
        const { module: moduleKey, actions } = item;
        const moduleRecord = await ModuleModel.findOne({ where: { key: moduleKey }, transaction });
        if (!moduleRecord) throw AppError.badRequest(`Unknown module identifier: ${moduleKey}`, 'INVALID_MODULE');

        for (const action of actions) {
          const permission = await Permission.findOne({
            where: { moduleId: moduleRecord.id, action },
            transaction,
          });
          if (!permission) throw AppError.badRequest(`Invalid action [${action}] for module [${moduleKey}]`, 'INVALID_ACTION');

          const [, created] = await SubAdminPermission.findOrCreate({
            where: { subadminId, permissionId: permission.id },
            defaults: { subadminId, permissionId: permission.id, assignedById },
            transaction,
          });
          assigned.push({ module: moduleKey, action, created });
        }
      }

      await auditLogService.log({
        actorId: assignedById,
        action: 'ASSIGN_PERMISSIONS',
        module: 'permissions',
        targetId: subadminId,
        details: { assigned },
        ipAddress,
        userAgent,
      }, transaction);

      await transaction.commit();
      return permissionQueryService.getSubadminPermissions(subadminId);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async revokePermissions({ subadminId, permissions, revokedById, ipAddress = null, userAgent = null }) {
    const subadmin = await userAccountService.findById(subadminId);
    if (!subadmin) throw AppError.notFound('Sub-admin not found', 'SUBADMIN_NOT_FOUND');

    const transaction = await sequelize.transaction();
    try {
      const revoked = [];
      for (const item of permissions) {
        const { module: moduleKey, actions } = item;
        const moduleRecord = await ModuleModel.findOne({ where: { key: moduleKey }, transaction });
        if (!moduleRecord) continue;

        for (const action of actions) {
          const permission = await Permission.findOne({
            where: { moduleId: moduleRecord.id, action },
            transaction,
          });
          if (permission) {
            const count = await SubAdminPermission.destroy({
              where: { subadminId, permissionId: permission.id },
              transaction,
            });
            if (count > 0) revoked.push({ module: moduleKey, action });
          }
        }
      }

      await auditLogService.log({
        actorId: revokedById,
        action: 'REVOKE_PERMISSIONS',
        module: 'permissions',
        targetId: subadminId,
        details: { revoked },
        ipAddress,
        userAgent,
      }, transaction);

      await transaction.commit();
      return permissionQueryService.getSubadminPermissions(subadminId);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
}

module.exports = new PermissionAssignmentService();