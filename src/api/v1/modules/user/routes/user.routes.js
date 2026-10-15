const express = require('express');
const profileController = require('../controllers/profile.controller');
const passwordController = require('../controllers/password.controller');
const { updateProfileSchema } = require('../validations/profile.validation');
const { changePasswordSchema } = require('../validations/password.validation');
const validate = require('../../../middleware/validate');
const authenticate = require('../../../middleware/authenticate');

const router = express.Router();

router.use(authenticate);

router.get('/profile', profileController.getProfile);
router.patch('/profile', validate(updateProfileSchema), profileController.updateProfile);
router.patch('/profile/password', validate(changePasswordSchema), passwordController.changePassword);

module.exports = router;