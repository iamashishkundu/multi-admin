const userAccountService = require('../services/user-account.service');
const userCredentialsService = require('../services/user-credentials.service');
const { successResponse } = require('../../../common/response');

class ProfileController {
  async getProfile(req, res, next) {
    try {
      const user = await userAccountService.findById(req.user.id);
      return successResponse(res, 'Profile retrieved successfully', user);
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { name, currentPassword, newPassword } = req.body;
      let updatedUser;

      if (newPassword) {
        updatedUser = await userCredentialsService.changePassword(req.user.id, currentPassword, newPassword);
      }

      if (name) {
        updatedUser = await userAccountService.updateUser(req.user.id, { name });
      }

      return successResponse(res, 'Profile updated successfully', updatedUser);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ProfileController();