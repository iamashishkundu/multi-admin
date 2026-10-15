const permissionsService = require('../src/api/v1/modules/permissions/services/permission-catalog.service');
const sequelize = require('../src/api/v1/config/database');
const logger = require('../src/api/v1/common/logger');

async function run() {
  try {
    await sequelize.authenticate();
    logger.info('Connected to PostgreSQL for permissions initialization.');

    await permissionsService.initPermissions();

    logger.info('All modules and action permissions verified and registered successfully.');
    process.exit(0);
  } catch (err) {
    logger.error(`Permissions initialization failed: ${err.message}`, { stack: err.stack });
    process.exit(1);
  }
}

run();
