const express = require('express');
const transactionLedgerController = require('../controllers/transaction-ledger.controller');
const transactionRefundController = require('../controllers/transaction-refund.controller');
const { transactionParamSchema, listTransactionsSchema, exportTransactionsSchema } = require('../validations/transaction-ledger.validation');
const { refundTransactionSchema } = require('../validations/transaction-refund.validation');
const validate = require('../../../middleware/validate');
const authenticate = require('../../../middleware/authenticate');
const authorizePermission = require('../../../middleware/authorizePermission');

const router = express.Router();
router.use(authenticate);

router.get('/', (req, res, next) => {
  if (req.user.role === 'user') return next();
  return authorizePermission('transactions', 'read')(req, res, next);
}, validate(listTransactionsSchema), transactionLedgerController.listTransactions);
router.get('/:id', (req, res, next) => {
  if (req.user.role === 'user') return next();
  return authorizePermission('transactions', 'read')(req, res, next);
}, validate(transactionParamSchema), transactionLedgerController.getTransactionById);
router.post('/export', authorizePermission('transactions', 'export'), validate(exportTransactionsSchema), transactionLedgerController.exportTransactions);
router.post('/:id/refund', authorizePermission('transactions', 'refund'), validate(refundTransactionSchema), transactionRefundController.refundTransaction);

module.exports = router;