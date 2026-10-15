const Wallet = require('../wallet.model');
const AppError = require('../../../common/AppError');

class WalletAccountService {
  async getOrCreateUserWallet(userId, transaction = null) {
    const [wallet] = await Wallet.findOrCreate({
      where: { userId },
      defaults: { userId, balance: 0.00, currency: 'USD', isActive: true },
      transaction,
    });
    return wallet;
  }

  async getWalletById(id) {
    const wallet = await Wallet.findByPk(id);
    if (!wallet) throw AppError.notFound('Wallet not found', 'WALLET_NOT_FOUND');
    return wallet;
  }
}

module.exports = new WalletAccountService();