const env = require('../src/api/v1/config/env');
const sequelize = require('../src/api/v1/config/database');
const userAccountService = require('../src/api/v1/modules/user/services/user-account.service');
const User = require('../src/api/v1/modules/user/user.model');
const logger = require('../src/api/v1/common/logger');

async function initAdmin() {
  const transaction = await sequelize.transaction();
  try {
    logger.info('Checking initial Admin configuration from environment variables...');

    const existingUser = await User.findOne({
      where: { email: env.ADMIN_EMAIL.toLowerCase() },
      paranoid: false,
      transaction,
    });

    if (existingUser) {
      if (existingUser.role === 'admin') {
        logger.info(`Admin account for email [${env.ADMIN_EMAIL}] already exists. Skipping creation.`);
        await transaction.commit();
        return;
      } else {
        // Identity and role conflict check: do not silently promote normal user or subadmin to admin!
        throw new Error(
          `Conflict: An existing account with email [${env.ADMIN_EMAIL}] has role '${existingUser.role}'. Refusing to overwrite or silently promote account to admin.`
        );
      }
    }

    // Check if another admin already exists
    const anyAdmin = await User.findOne({
      where: { role: 'admin' },
      transaction,
    });

    if (anyAdmin) {
      logger.warn(
        `An admin account (${anyAdmin.email}) is already present in the database. Creating additional configured admin [${env.ADMIN_EMAIL}]...`
      );
    }

    const newAdmin = await userAccountService.createUser(
      {
        name: env.ADMIN_NAME,
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
        role: 'admin',
        isActive: true,
      },
      transaction
    );

    await transaction.commit();
    logger.info(`Initial Admin account [${newAdmin.email}] successfully initialized.`);
  } catch (err) {
    await transaction.rollback();
    logger.error(`Admin initialization failed: ${err.message}`);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  initAdmin();
}

module.exports = { initAdmin };
