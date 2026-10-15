const registrationService = require('../services/registration.service');
const { createdResponse } = require('../../../common/response');

class RegisterController {
  async register(req, res, next) {
    try {
      const result = await registrationService.register(req.body);
      return createdResponse(res, 'User registered successfully', result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new RegisterController();