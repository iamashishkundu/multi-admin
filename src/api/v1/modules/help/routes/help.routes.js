const express = require('express');
const ticketQueryController = require('../controllers/ticket-query.controller');
const ticketAssignmentController = require('../controllers/ticket-assignment.controller');
const ticketResolutionController = require('../controllers/ticket-resolution.controller');
const { ticketParamSchema, createTicketSchema, listTicketsSchema } = require('../validations/ticket-query.validation');
const { assignTicketSchema } = require('../validations/ticket-assignment.validation');
const { resolveTicketSchema } = require('../validations/ticket-resolution.validation');
const validate = require('../../../middleware/validate');
const authenticate = require('../../../middleware/authenticate');
const authorizePermission = require('../../../middleware/authorizePermission');

const router = express.Router();
router.use(authenticate);

router.get('/', (req, res, next) => {
  if (req.user.role === 'user') return next();
  return authorizePermission('help', 'read')(req, res, next);
}, validate(listTicketsSchema), ticketQueryController.listTickets);
router.get('/:id', (req, res, next) => {
  if (req.user.role === 'user') return next();
  return authorizePermission('help', 'read')(req, res, next);
}, validate(ticketParamSchema), ticketQueryController.getTicketById);
router.post('/', (req, res, next) => {
  if (req.user.role === 'user') return next();
  return authorizePermission('help', 'create')(req, res, next);
}, validate(createTicketSchema), ticketQueryController.createTicket);
router.patch('/:id/assign', authorizePermission('help', 'assign'), validate(assignTicketSchema), ticketAssignmentController.assignTicket);
router.patch('/:id/resolve', authorizePermission('help', 'resolve'), validate(resolveTicketSchema), ticketResolutionController.resolveTicket);

module.exports = router;