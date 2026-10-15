const permissionQueryService = require('../services/permission-query.service');
const { successResponse } = require('../../../common/response');
const AppError = require('../../../common/AppError');

class PermissionQueryController {
  async getSubadminPermissions(req, res, next) {
    try {
      const { id } = req.params;
      if (req.user.role === 'subadmin' && req.user.id !== id) {
        throw AppError.forbidden('Sub-admins can only view their own permissions', 'FORBIDDEN');
      }
      const permissions = await permissionQueryService.getSubadminPermissions(id);
      return successResponse(res, 'Sub-admin permissions retrieved successfully', permissions);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PermissionQueryController();