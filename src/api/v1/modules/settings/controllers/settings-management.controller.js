const settingsManagementService = require('../services/settings-management.service');
const { successResponse } = require('../../../common/response');

class SettingsManagementController {
  async updateSetting(req, res, next) {
    try {
      const setting = await settingsManagementService.updateSetting(
        req.params.key,
        req.body,
        req.user.id,
        req.ip,
        req.headers['user-agent']
      );
      return successResponse(res, 'Setting updated successfully', setting);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SettingsManagementController();