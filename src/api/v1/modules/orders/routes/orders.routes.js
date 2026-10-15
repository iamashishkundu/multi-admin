const express = require('express');
const orderCreationController = require('../controllers/order-creation.controller');
const orderQueryController = require('../controllers/order-query.controller');
const orderStatusController = require('../controllers/order-status.controller');
const { createOrderSchema } = require('../validations/order-creation.validation');
const { orderParamSchema, listOrdersSchema } = require('../validations/order-query.validation');
const { updateOrderStatusSchema } = require('../validations/order-status.validation');
const validate = require('../../../middleware/validate');
const authenticate = require('../../../middleware/authenticate');
const authorizePermission = require('../../../middleware/authorizePermission');

const router = express.Router();
router.use(authenticate);

router.get('/', (req, res, next) => {
  if (req.user.role === 'user') return next();
  return authorizePermission('orders', 'read')(req, res, next);
}, validate(listOrdersSchema), orderQueryController.listOrders);
router.get('/:id', (req, res, next) => {
  if (req.user.role === 'user') return next();
  return authorizePermission('orders', 'read')(req, res, next);
}, validate(orderParamSchema), orderQueryController.getOrderById);
router.post('/', (req, res, next) => {
  if (req.user.role === 'user') return next();
  return authorizePermission('orders', 'create')(req, res, next);
}, validate(createOrderSchema), orderCreationController.createOrder);
router.patch('/:id/status', authorizePermission('orders', 'update-status'), validate(updateOrderStatusSchema), orderStatusController.updateOrderStatus);
router.post('/:id/cancel', (req, res, next) => {
  if (req.user.role === 'user') return next();
  return authorizePermission('orders', 'cancel')(req, res, next);
}, validate(orderParamSchema), orderStatusController.cancelOrder);

module.exports = router;