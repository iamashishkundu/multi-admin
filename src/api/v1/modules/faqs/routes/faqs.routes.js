const express = require('express');
const faqManagementController = require('../controllers/faq-management.controller');
const faqPublicationController = require('../controllers/faq-publication.controller');
const faqQueryController = require('../controllers/faq-query.controller');
const { faqParamSchema, createFaqSchema, updateFaqSchema } = require('../validations/faq-management.validation');
const { publishFaqSchema } = require('../validations/faq-publication.validation');
const { listFaqsSchema } = require('../validations/faq-query.validation');
const validate = require('../../../middleware/validate');
const authenticate = require('../../../middleware/authenticate');
const authorizePermission = require('../../../middleware/authorizePermission');

const router = express.Router();

router.get('/', (req, res, next) => {
  if (req.headers.authorization) return authenticate(req, res, next);
  next();
}, validate(listFaqsSchema), faqQueryController.listFaqs);

router.post('/', authenticate, authorizePermission('faq', 'create'), validate(createFaqSchema), faqManagementController.createFaq);
router.patch('/:id', authenticate, authorizePermission('faq', 'update'), validate(updateFaqSchema), faqManagementController.updateFaq);
router.patch('/:id/publish', authenticate, authorizePermission('faq', 'publish'), validate(publishFaqSchema), faqPublicationController.publishFaq);
router.delete('/:id', authenticate, authorizePermission('faq', 'delete'), validate(faqParamSchema), faqManagementController.deleteFaq);

module.exports = router;