const settingsQueryService = require('../services/settings-query.service');
const { successResponse } = require('../../../common/response');

class SettingsQueryController {
  async listSettings(req, res, next) {
    try {
      const settings = await settingsQueryService.listSettings(req.query, req.user);
      return successResponse(res, 'Settings retrieved successfully', settings);
    } catch (err) {
      next(err);
    }
  }

  async getSettingByKey(req, res, next) {
    try {
      const setting = await settingsQueryService.getSettingByKey(req.params.key, req.user);
      return successResponse(res, 'Setting retrieved successfully', setting);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SettingsQueryController();