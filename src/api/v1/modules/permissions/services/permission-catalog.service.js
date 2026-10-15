const ModuleModel = require('../module.model');
const Permission = require('../permission.model');
const { MODULE_PERMISSIONS_DEF } = require('../permissions.constants');
const logger = require('../../../common/logger');

class PermissionCatalogService {
  async initPermissions() {
    logger.info('Initializing module and action permissions in database...');
    for (const [key, def] of Object.entries(MODULE_PERMISSIONS_DEF)) {
      const [moduleRecord] = await ModuleModel.findOrCreate({
        where: { key },
        defaults: { key, name: def.name, description: def.description },
      });

      if (moduleRecord.name !== def.name || moduleRecord.description !== def.description) {
        moduleRecord.name = def.name;
        moduleRecord.description = def.description;
        await moduleRecord.save();
      }

      for (const action of def.actions) {
        await Permission.findOrCreate({
          where: { moduleId: moduleRecord.id, action },
          defaults: {
            moduleId: moduleRecord.id,
            action,
            description: `Permission to ${action} in ${def.name}`,
          },
        });
      }
    }
    logger.info('Permissions initialization completed successfully.');
  }

  async getModulesAndPermissions() {
    return ModuleModel.findAll({
      include: [{
        model: Permission,
        as: 'permissions',
        attributes: ['id', 'action', 'description'],
      }],
      order: [['name', 'ASC']],
    });
  }
}

module.exports = new PermissionCatalogService();