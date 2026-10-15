const { Sequelize } = require('sequelize');
const env = require('./env');
const logger = require('../common/logger');

const dialectOptions = {};
if (env.DB_SSL) {
  dialectOptions.ssl = {
    require: true,
    rejectUnauthorized: false,
  };
}

const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
  host: env.DB_HOST,
  port: env.DB_PORT,
  dialect: 'postgres',
  dialectOptions,
  logging: (msg) => {
    if (env.NODE_ENV === 'development') {
      logger.debug(msg);
    }
  },
  pool: {
    max: 20,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true,
  },
});

module.exports = sequelize;
