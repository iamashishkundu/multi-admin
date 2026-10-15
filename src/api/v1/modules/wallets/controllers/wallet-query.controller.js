const walletAccountService = require('../services/wallet-account.service');
const { successResponse } = require('../../../common/response');

class WalletQueryController {
  async getMyWallet(req, res, next) {
    try {
      const wallet = await walletAccountService.getOrCreateUserWallet(req.user.id);
      return successResponse(res, 'User wallet retrieved successfully', wallet);
    } catch (err) {
      next(err);
    }
  }

  async getWalletById(req, res, next) {
    try {
      const wallet = await walletAccountService.getWalletById(req.params.id);
      return successResponse(res, 'Wallet retrieved successfully', wallet);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new WalletQueryController();