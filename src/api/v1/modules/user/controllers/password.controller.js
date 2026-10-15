const userCredentialsService = require('../services/user-credentials.service');
const { successResponse } = require('../../../common/response');

class PasswordController {
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await userCredentialsService.changePassword(
        req.user.id,
        currentPassword,
        newPassword
      );
      return successResponse(res, 'Password changed successfully', user);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PasswordController();