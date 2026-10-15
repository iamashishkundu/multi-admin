const userAccountService = require('../../user/services/user-account.service');
const userCredentialsService = require('../../user/services/user-credentials.service');
const userSerializerService = require('../../user/services/user-serializer.service');
const tokenService = require('./token.service');
const AppError = require('../../../common/AppError');

class LoginService {
  async login({ email, password }) {
    const userWithPassword = await userAccountService.findByEmail(email, { includePassword: true });
    if (!userWithPassword) throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    if (!userWithPassword.isActive) {
      throw AppError.forbidden('Your account has been deactivated. Please contact an administrator.', 'ACCOUNT_DEACTIVATED');
    }

    const isMatch = await userCredentialsService.comparePassword(password, userWithPassword.passwordHash);
    if (!isMatch) throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');

    const user = userSerializerService.sanitizeUser(userWithPassword);
    return { user, token: tokenService.generateToken(user) };
  }
}

module.exports = new LoginService();