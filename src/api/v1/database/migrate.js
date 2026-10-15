const fs = require('fs');
const path = require('path');
const { QueryTypes } = require('sequelize');
const sequelize = require('../config/database');
const logger = require('../common/logger');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function ensureMetaTable() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
      "name" VARCHAR(255) NOT NULL PRIMARY KEY,
      "executedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getExecutedMigrations() {
  const records = await sequelize.query(
    'SELECT "name" FROM "SequelizeMeta" ORDER BY "name" ASC;',
    { type: QueryTypes.SELECT }
  );
  return records.map((r) => r.name);
}

async function runMigrations() {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established for migrations.');

    await ensureMetaTable();
    const executed = await getExecutedMigrations();

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((file) => file.endsWith('.js'))
      .sort();

    const pending = files.filter((f) => !executed.includes(f));

    if (pending.length === 0) {
      logger.info('No pending migrations. Database is up to date.');
      return;
    }

    logger.info(`Found ${pending.length} pending migration(s). Executing...`);

    const queryInterface = sequelize.getQueryInterface();

    for (const file of pending) {
      const migrationPath = path.join(MIGRATIONS_DIR, file);
      const migration = require(migrationPath);
      logger.info(`Migrating: ${file}`);

      const transaction = await sequelize.transaction();
      try {
        await migration.up(queryInterface, sequelize.constructor);
        await sequelize.query(
          'INSERT INTO "SequelizeMeta" ("name") VALUES (:name);',
          {
            replacements: { name: file },
            type: QueryTypes.INSERT,
            transaction,
          }
        );
        await transaction.commit();
        logger.info(`Migrated:  ${file}`);
      } catch (err) {
        await transaction.rollback();
        logger.error(`Migration failed on ${file}: ${err.message}`, { stack: err.stack });
        throw err;
      }
    }

    logger.info('All migrations completed successfully.');
  } catch (err) {
    logger.error(`Migration runner encountered error: ${err.message}`);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
