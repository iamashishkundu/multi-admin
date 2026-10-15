const Setting = require('../setting.model');
const auditLogService = require('../../admin/services/audit-log.service');

class SettingsManagementService {
  async updateSetting(key, { value, description, isPublic }, actorId, ipAddress = null, userAgent = null) {
    const [setting, created] = await Setting.findOrCreate({
      where: { key },
      defaults: { key, value, description: description || null, isPublic: isPublic !== undefined ? isPublic : false },
    });
    if (!created) {
      if (value !== undefined) setting.value = value;
      if (description !== undefined) setting.description = description;
      if (typeof isPublic === 'boolean') setting.isPublic = isPublic;
      await setting.save();
    }
    await auditLogService.log({
      actorId,
      action: created ? 'SETTING_CREATE' : 'SETTING_UPDATE',
      module: 'settings',
      targetId: setting.key,
      details: { value: setting.value, isPublic: setting.isPublic },
      ipAddress,
      userAgent,
    });
    return setting;
  }
}

module.exports = new SettingsManagementService();