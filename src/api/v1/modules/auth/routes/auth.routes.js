const express = require('express');
const registerController = require('../controllers/register.controller');
const loginController = require('../controllers/login.controller');
const logoutController = require('../controllers/logout.controller');
const { registerSchema } = require('../validations/register.validation');
const { loginSchema } = require('../validations/login.validation');
const validate = require('../../../middleware/validate');
const authenticate = require('../../../middleware/authenticate');
const { authRateLimiter } = require('../../../middleware/rateLimiter');

const router = express.Router();

router.post('/register', authRateLimiter, validate(registerSchema), registerController.register);
router.post('/login', authRateLimiter, validate(loginSchema), loginController.login);
router.post('/logout', authenticate, logoutController.logout);

module.exports = router;