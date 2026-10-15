const faqQueryService = require('../services/faq-query.service');
const { successResponse } = require('../../../common/response');

class FaqQueryController {
  async listFaqs(req, res, next) {
    try {
      const isPublic = !req.user || req.user.role === 'user';
      const { rows, pagination } = await faqQueryService.listFaqs(req.query, isPublic);
      return successResponse(res, 'FAQs retrieved successfully', rows, 200, pagination);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new FaqQueryController();