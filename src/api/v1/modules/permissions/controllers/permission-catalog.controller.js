const permissionCatalogService = require('../services/permission-catalog.service');
const { successResponse } = require('../../../common/response');

class PermissionCatalogController {
  async getModules(req, res, next) {
    try {
      const modules = await permissionCatalogService.getModulesAndPermissions();
      return successResponse(res, 'Modules and permissions retrieved successfully', modules);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PermissionCatalogController();