const loginService = require('../services/login.service');
const { successResponse } = require('../../../common/response');

class LoginController {
  async login(req, res, next) {
    try {
      const result = await loginService.login(req.body);
      return successResponse(res, 'Login successful', result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new LoginController();