const sessionService = require('../services/session.service');
const { successResponse } = require('../../../common/response');

class LogoutController {
  async logout(req, res, next) {
    try {
      await sessionService.logout(req.user.id);
      return successResponse(res, 'Logged out successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new LogoutController();