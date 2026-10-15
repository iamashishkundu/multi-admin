const userCredentialsService = require('../../user/services/user-credentials.service');

class SessionService {
  async logout(userId) {
    await userCredentialsService.incrementTokenVersion(userId);
    return true;
  }
}

module.exports = new SessionService();