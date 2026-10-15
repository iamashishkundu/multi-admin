const jwt = require('jsonwebtoken');
const env = require('../../../config/env');

class TokenService {
  generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };

    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
  }
}

module.exports = new TokenService();