const { ZodError } = require('zod');
const {
  UniqueConstraintError,
  ForeignKeyConstraintError,
  DatabaseError,
} = require('sequelize');
const AppError = require('../common/AppError');
const logger = require('../common/logger');
const env = require('../config/env');

const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errorCode = 'INTERNAL_ERROR';
  let details = null;

  // Log error
  if (err.isOperational) {
    logger.warn(`[OperationalError] ${err.statusCode} - ${err.message}`, {
      path: req.originalUrl,
      method: req.method,
      code: err.code,
      details: err.details,
    });
  } else {
    logger.error(`[UnhandledError] ${err.message}`, {
      path: req.originalUrl,
      method: req.method,
      stack: err.stack,
    });
  }

  // Handle Zod Validation Error
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation error';
    errorCode = 'VALIDATION_ERROR';
    details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }
  // Handle Operational AppError
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorCode = err.code;
    details = err.details;
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
    errorCode = 'INVALID_TOKEN';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired';
    errorCode = 'TOKEN_EXPIRED';
  }
  // Handle Sequelize Unique Constraint Error
  else if (err instanceof UniqueConstraintError) {
    statusCode = 409;
    message = 'Resource already exists with unique field conflict';
    errorCode = 'CONFLICT';
    details = err.errors ? err.errors.map((e) => ({ field: e.path, message: e.message })) : null;
  }
  // Handle Sequelize Foreign Key Error
  else if (err instanceof ForeignKeyConstraintError) {
    statusCode = 400;
    message = 'Referenced resource does not exist';
    errorCode = 'FOREIGN_KEY_VIOLATION';
  }
  // Handle PostgreSQL Database errors
  else if (err instanceof DatabaseError) {
    statusCode = 400;
    message = 'Database operation failed';
    errorCode = 'DATABASE_ERROR';
    if (env.NODE_ENV !== 'production') {
      details = err.message;
    }
  }

  const responsePayload = {
    success: false,
    message,
    error: {
      code: errorCode,
    },
  };

  if (details) {
    responsePayload.error.details = details;
  }

  if (env.NODE_ENV !== 'production' && !err.isOperational && err.stack) {
    responsePayload.error.stack = err.stack;
  }

  return res.status(statusCode).json(responsePayload);
};

module.exports = errorHandler;
