const adminService = require('../services/admin.service');
const { successResponse, createdResponse } = require('../../../common/response');

class UserManagementController {
  async createUser(req, res, next) {
    try {
      const user = await adminService.createUser(req.body, req.user.id, req.ip, req.headers['user-agent']);
      return createdResponse(res, 'User created successfully', user);
    } catch (err) {
      next(err);
    }
  }

  async updateUser(req, res, next) {
    try {
      const user = await adminService.updateUser(req.params.id, req.body, req.user.id, req.ip, req.headers['user-agent']);
      return successResponse(res, 'User updated successfully', user);
    } catch (err) {
      next(err);
    }
  }

  async deleteUser(req, res, next) {
    try {
      await adminService.deleteUser(req.params.id, req.user.id, req.ip, req.headers['user-agent']);
      return successResponse(res, 'User deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await adminService.getUserById(req.params.id);
      return successResponse(res, 'User retrieved successfully', user);
    } catch (err) {
      next(err);
    }
  }

  async listUsers(req, res, next) {
    try {
      const { rows, pagination } = await adminService.listUsers(req.query);
      return successResponse(res, 'Users retrieved successfully', rows, 200, pagination);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserManagementController();