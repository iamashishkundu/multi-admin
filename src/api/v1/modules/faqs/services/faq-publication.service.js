const Faq = require('../faq.model');
const auditLogService = require('../../admin/services/audit-log.service');
const AppError = require('../../../common/AppError');

class FaqPublicationService {
  async publishFaq(id, isPublished, actorId, ipAddress = null, userAgent = null) {
    const faq = await Faq.findByPk(id);
    if (!faq) throw AppError.notFound('FAQ not found', 'FAQ_NOT_FOUND');
    faq.isPublished = isPublished;
    await faq.save();
    await auditLogService.log({ actorId, action: 'FAQ_PUBLISH', module: 'faq', targetId: faq.id,
      details: { isPublished }, ipAddress, userAgent });
    return faq;
  }
}

module.exports = new FaqPublicationService();