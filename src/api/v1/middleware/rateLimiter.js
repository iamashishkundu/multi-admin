const rateLimit = require('express-rate-limit');
const AppError = require('../common/AppError');

const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new AppError('Too many requests from this IP, please try again later.', 429, 'RATE_LIMIT_EXCEEDED'));
  },
});

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit login attempts
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new AppError('Too many authentication attempts, please try again later.', 429, 'AUTH_RATE_LIMIT_EXCEEDED'));
  },
});

module.exports = {
  globalRateLimiter,
  authRateLimiter,
};
