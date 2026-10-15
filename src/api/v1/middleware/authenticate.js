const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../common/AppError');
const userAccountService = require('../modules/user/services/user-account.service');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('Authentication token is required', 'TOKEN_REQUIRED');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw AppError.unauthorized('Authentication token is missing', 'TOKEN_REQUIRED');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw AppError.unauthorized('Authentication token has expired', 'TOKEN_EXPIRED');
      }
      throw AppError.unauthorized('Invalid or malformed authentication token', 'INVALID_TOKEN');
    }

    // Identify the authenticated account from trusted database data
    const user = await userAccountService.findById(decoded.id, { includePassword: false });
    if (!user) {
      throw AppError.unauthorized('User associated with token no longer exists', 'USER_NOT_FOUND');
    }

    // Confirm that the account is active
    if (!user.isActive) {
      throw AppError.forbidden('User account is deactivated', 'ACCOUNT_DEACTIVATED');
    }

    // Token version verification: ensures immediate invalidation upon logout / password change
    if (decoded.tokenVersion !== user.tokenVersion) {
      throw AppError.unauthorized('Token session has been invalidated. Please log in again.', 'SESSION_INVALIDATED');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = authenticate;
