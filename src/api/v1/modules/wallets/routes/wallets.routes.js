const express = require('express');
const walletQueryController = require('../controllers/wallet-query.controller');
const walletBalanceController = require('../controllers/wallet-balance.controller');
const { walletParamSchema } = require('../validations/wallet-query.validation');
const { creditWalletSchema, debitWalletSchema, adjustWalletSchema } = require('../validations/wallet-balance.validation');
const validate = require('../../../middleware/validate');
const authenticate = require('../../../middleware/authenticate');
const authorizePermission = require('../../../middleware/authorizePermission');

const router = express.Router();
router.use(authenticate);

router.get('/my-wallet', walletQueryController.getMyWallet);
router.get('/:id', authorizePermission('wallet', 'read'), validate(walletParamSchema), walletQueryController.getWalletById);
router.post('/:id/credit', authorizePermission('wallet', 'credit'), validate(creditWalletSchema), walletBalanceController.creditWallet);
router.post('/:id/debit', authorizePermission('wallet', 'debit'), validate(debitWalletSchema), walletBalanceController.debitWallet);
router.post('/:id/adjust', authorizePermission('wallet', 'adjust'), validate(adjustWalletSchema), walletBalanceController.adjustWallet);

module.exports = router;