const Faq = require('../faq.model');
const auditLogService = require('../../admin/services/audit-log.service');
const AppError = require('../../../common/AppError');

class FaqManagementService {
  async createFaq(data, actorId, ipAddress = null, userAgent = null) {
    const faq = await Faq.create({
      question: data.question,
      answer: data.answer,
      category: data.category || 'general',
      isPublished: data.isPublished || false,
    });
    await auditLogService.log({
      actorId, action: 'FAQ_CREATE', module: 'faq', targetId: faq.id,
      details: { category: faq.category, isPublished: faq.isPublished }, ipAddress, userAgent,
    });
    return faq;
  }

  async updateFaq(id, data, actorId, ipAddress = null, userAgent = null) {
    const faq = await Faq.findByPk(id);
    if (!faq) throw AppError.notFound('FAQ not found', 'FAQ_NOT_FOUND');
    if (data.question) faq.question = data.question;
    if (data.answer) faq.answer = data.answer;
    if (data.category) faq.category = data.category;
    if (typeof data.isPublished === 'boolean') faq.isPublished = data.isPublished;
    await faq.save();
    await auditLogService.log({ actorId, action: 'FAQ_UPDATE', module: 'faq', targetId: faq.id, details: data, ipAddress, userAgent });
    return faq;
  }

  async deleteFaq(id, actorId, ipAddress = null, userAgent = null) {
    const faq = await Faq.findByPk(id);
    if (!faq) throw AppError.notFound('FAQ not found', 'FAQ_NOT_FOUND');
    await faq.destroy();
    await auditLogService.log({ actorId, action: 'FAQ_DELETE', module: 'faq', targetId: id, details: null, ipAddress, userAgent });
    return true;
  }
}

module.exports = new FaqManagementService();