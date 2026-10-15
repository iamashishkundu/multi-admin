const permissionAssignmentService = require('../services/permission-assignment.service');
const { successResponse } = require('../../../common/response');

class PermissionAssignmentController {
  async assignPermissions(req, res, next) {
    try {
      const updatedPermissions = await permissionAssignmentService.assignPermissions({
        subadminId: req.body.subadminId,
        permissions: req.body.permissions,
        assignedById: req.user.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      return successResponse(res, 'Permissions assigned successfully', updatedPermissions);
    } catch (err) {
      next(err);
    }
  }

  async revokePermissions(req, res, next) {
    try {
      const updatedPermissions = await permissionAssignmentService.revokePermissions({
        subadminId: req.body.subadminId,
        permissions: req.body.permissions,
        revokedById: req.user.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      return successResponse(res, 'Permissions revoked successfully', updatedPermissions);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PermissionAssignmentController();