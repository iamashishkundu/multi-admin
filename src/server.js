const app = require('./app');
const env = require('./api/v1/config/env');
const sequelize = require('./api/v1/config/database');
const logger = require('./api/v1/common/logger');

// Load database models and associations
require('./api/v1/database/models/index');

let server;

async function startServer() {
  try {
    // 1. Authenticate PostgreSQL connection
    await sequelize.authenticate();
    logger.info('Database connection pool established successfully.');

    // 2. Start HTTP server
    server = app.listen(env.PORT, () => {
      logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
      logger.info(`Base API endpoint: http://localhost:${env.PORT}/api/v1`);
      logger.info(`Health check endpoint: http://localhost:${env.PORT}/api/v1/health`);
    });
  } catch (err) {
    logger.error(`Unable to start server: ${err.message}`, { stack: err.stack });
    process.exit(1);
  }
}

// Graceful shutdown handler
async function gracefulShutdown(signal) {
  logger.info(`${signal} received. Initiating graceful shutdown...`);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      try {
        await sequelize.close();
        logger.info('Database connection pool closed.');
        process.exit(0);
      } catch (err) {
        logger.error(`Error closing database connection: ${err.message}`);
        process.exit(1);
      }
    });

    // Force close after 10s timeout
    setTimeout(() => {
      logger.error('Graceful shutdown timeout exceeded. Forcing process exit.');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection:', { reason });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', { error: err.message, stack: err.stack });
  process.exit(1);
});

startServer();
