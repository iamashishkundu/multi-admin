const walletBalanceService = require('../services/wallet-balance.service');
const { successResponse } = require('../../../common/response');

class WalletBalanceController {
  async creditWallet(req, res, next) {
    try {
      const result = await walletBalanceService.creditWallet(req.params.id, req.body, req.user.id, req.ip, req.headers['user-agent']);
      return successResponse(res, 'Wallet credited successfully', result);
    } catch (err) {
      next(err);
    }
  }

  async debitWallet(req, res, next) {
    try {
      const result = await walletBalanceService.debitWallet(req.params.id, req.body, req.user.id, req.ip, req.headers['user-agent']);
      return successResponse(res, 'Wallet debited successfully', result);
    } catch (err) {
      next(err);
    }
  }

  async adjustWallet(req, res, next) {
    try {
      const result = await walletBalanceService.adjustWallet(req.params.id, req.body, req.user.id, req.ip, req.headers['user-agent']);
      return successResponse(res, 'Wallet balance adjusted successfully', result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new WalletBalanceController();