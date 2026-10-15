const ModuleModel = require('../module.model');
const Permission = require('../permission.model');
const SubAdminPermission = require('../subadmin-permission.model');

class PermissionQueryService {
  async getSubadminPermissions(subadminId) {
    const assignments = await SubAdminPermission.findAll({
      where: { subadminId },
      include: [{
        model: Permission,
        as: 'permission',
        include: [{ model: ModuleModel, as: 'module', attributes: ['id', 'key', 'name'] }],
      }],
    });

    const grouped = {};
    for (const assignment of assignments) {
      if (!assignment.permission || !assignment.permission.module) continue;
      const moduleKey = assignment.permission.module.key;
      if (!grouped[moduleKey]) {
        grouped[moduleKey] = {
          moduleKey,
          moduleName: assignment.permission.module.name,
          actions: [],
        };
      }
      grouped[moduleKey].actions.push({
        permissionId: assignment.permission.id,
        action: assignment.permission.action,
        assignedAt: assignment.createdAt,
      });
    }

    return Object.values(grouped);
  }

  async hasPermission(subadminId, moduleKey, action) {
    const assignment = await SubAdminPermission.findOne({
      where: { subadminId },
      include: [{
        model: Permission,
        as: 'permission',
        where: { action },
        required: true,
        include: [{
          model: ModuleModel,
          as: 'module',
          where: { key: moduleKey },
          required: true,
        }],
      }],
    });

    return !!assignment;
  }
}

module.exports = new PermissionQueryService();