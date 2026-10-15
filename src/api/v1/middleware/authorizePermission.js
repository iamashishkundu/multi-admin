const AppError = require('../common/AppError');
const permissionsService = require('../modules/permissions/services/permission-query.service');

/**
 * Reusable dynamic permission authorization middleware
 * @param {string} moduleKey - Registered module key (e.g., 'orders', 'wallet')
 * @param {string} action - Registered action (e.g., 'read', 'create', 'refund')
 */
const authorizePermission = (moduleKey, action) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(AppError.unauthorized('Authentication required', 'AUTHENTICATION_REQUIRED'));
      }

      // 1. Admin has full unrestricted access to all modules and actions
      if (req.user.role === 'admin') {
        return next();
      }

      // 2. Sub-admin must have explicitly granted database permission
      if (req.user.role === 'subadmin') {
        const hasPerm = await permissionsService.hasPermission(req.user.id, moduleKey, action);
        if (!hasPerm) {
          return next(
            AppError.forbidden(
              `Permission denied: Account lacks required permission [${moduleKey}.${action}]`,
              'FORBIDDEN',
              { module: moduleKey, action }
            )
          );
        }
        return next();
      }

      // 3. Normal users do not have dynamic administrative permissions
      return next(
        AppError.forbidden(
          `Permission denied: Role '${req.user.role}' cannot perform administrative action [${moduleKey}.${action}]`,
          'FORBIDDEN'
        )
      );
    } catch (err) {
      next(err);
    }
  };
};

module.exports = authorizePermission;
