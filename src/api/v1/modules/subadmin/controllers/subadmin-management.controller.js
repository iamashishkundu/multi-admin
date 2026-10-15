const subAdminManagementService = require('../services/subadmin-management.service');
const { successResponse, createdResponse } = require('../../../common/response');

class SubAdminManagementController {
  async createSubAdmin(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const subadmin = await subAdminManagementService.createSubAdmin(
        { name, email, password },
        req.user.id,
        req.ip,
        req.headers['user-agent']
      );
      return createdResponse(res, 'Sub-admin created successfully', subadmin);
    } catch (err) {
      next(err);
    }
  }

  async updateSubAdmin(req, res, next) {
    try {
      const subadmin = await subAdminManagementService.updateSubAdmin(
        req.params.id,
        req.body,
        req.user.id,
        req.ip,
        req.headers['user-agent']
      );
      return successResponse(res, 'Sub-admin updated successfully', subadmin);
    } catch (err) {
      next(err);
    }
  }

  async getSubAdminById(req, res, next) {
    try {
      const subadmin = await subAdminManagementService.getSubAdminById(req.params.id);
      return successResponse(res, 'Sub-admin retrieved successfully', subadmin);
    } catch (err) {
      next(err);
    }
  }

  async listSubAdmins(req, res, next) {
    try {
      const { rows, pagination } = await subAdminManagementService.listSubAdmins(req.query);
      return successResponse(res, 'Sub-admins retrieved successfully', rows, 200, pagination);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SubAdminManagementController();