const faqManagementService = require('../services/faq-management.service');
const { successResponse, createdResponse } = require('../../../common/response');

class FaqManagementController {
  async createFaq(req, res, next) {
    try {
      const faq = await faqManagementService.createFaq(req.body, req.user.id, req.ip, req.headers['user-agent']);
      return createdResponse(res, 'FAQ created successfully', faq);
    } catch (err) {
      next(err);
    }
  }

  async updateFaq(req, res, next) {
    try {
      const faq = await faqManagementService.updateFaq(req.params.id, req.body, req.user.id, req.ip, req.headers['user-agent']);
      return successResponse(res, 'FAQ updated successfully', faq);
    } catch (err) {
      next(err);
    }
  }

  async deleteFaq(req, res, next) {
    try {
      await faqManagementService.deleteFaq(req.params.id, req.user.id, req.ip, req.headers['user-agent']);
      return successResponse(res, 'FAQ deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new FaqManagementController();