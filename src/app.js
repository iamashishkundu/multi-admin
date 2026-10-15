const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const apiV1Router = require('./api/v1/index');
const errorHandler = require('./api/v1/middleware/errorHandler');
const { globalRateLimiter } = require('./api/v1/middleware/rateLimiter');
const logger = require('./api/v1/common/logger');
const AppError = require('./api/v1/common/AppError');

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Global rate limiting
app.use(globalRateLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  next();
});

// Mount API versioning routes
app.use('/api/v1', apiV1Router);

// Handle unknown routes
app.use((req, res, next) => {
  next(AppError.notFound(`Route [${req.method} ${req.originalUrl}] not found on this server`, 'ROUTE_NOT_FOUND'));
});

// Centralized error handling middleware
app.use(errorHandler);

module.exports = app;
