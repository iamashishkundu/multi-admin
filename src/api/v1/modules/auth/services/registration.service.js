const userAccountService = require('../../user/services/user-account.service');
const tokenService = require('./token.service');

class RegistrationService {
  async register({ name, email, password }) {
    const user = await userAccountService.createUser({
      name,
      email,
      password,
      role: 'user',
      isActive: true,
    });

    return { user, token: tokenService.generateToken(user) };
  }
}

module.exports = new RegistrationService();