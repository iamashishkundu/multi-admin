const faqPublicationService = require('../services/faq-publication.service');
const { successResponse } = require('../../../common/response');

class FaqPublicationController {
  async publishFaq(req, res, next) {
    try {
      const faq = await faqPublicationService.publishFaq(req.params.id, req.body.isPublished, req.user.id, req.ip, req.headers['user-agent']);
      return successResponse(res, 'FAQ publication status updated', faq);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new FaqPublicationController();