const Setting = require('../setting.model');
const AppError = require('../../../common/AppError');

class SettingsQueryService {
  async listSettings(query, requestingUser) {
    const where = {};
    if (!requestingUser || requestingUser.role === 'user') where.isPublic = true;
    else if (query.isPublic !== undefined) where.isPublic = query.isPublic === 'true' || query.isPublic === true;
    return Setting.findAll({ where, order: [['key', 'ASC']] });
  }

  async getSettingByKey(key, requestingUser) {
    const setting = await Setting.findOne({ where: { key } });
    if (!setting) throw AppError.notFound(`Setting with key '${key}' not found`, 'SETTING_NOT_FOUND');
    if ((!requestingUser || requestingUser.role === 'user') && !setting.isPublic) {
      throw AppError.forbidden('Access denied to private setting', 'FORBIDDEN');
    }
    return setting;
  }
}

module.exports = new SettingsQueryService();