const subAdminStatusService = require('../services/subadmin-status.service');
const { successResponse } = require('../../../common/response');

class SubAdminStatusController {
  async deactivateSubAdmin(req, res, next) {
    try {
      const subadmin = await subAdminStatusService.deactivateSubAdmin(
        req.params.id,
        req.user.id,
        req.ip,
        req.headers['user-agent']
      );
      return successResponse(res, 'Sub-admin deactivated successfully', subadmin);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SubAdminStatusController();