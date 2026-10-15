const bcrypt = require('bcryptjs');
const User = require('../user.model');
const AppError = require('../../../common/AppError');
const userSerializer = require('./user-serializer.service');

class UserCredentialsService {
  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async comparePassword(plainPassword, passwordHash) {
    return bcrypt.compare(plainPassword, passwordHash);
  }

  async changePassword(id, currentPassword, newPassword) {
    const user = await User.findByPk(id);
    if (!user) {
      throw AppError.notFound('User not found', 'USER_NOT_FOUND');
    }

    const isMatch = await this.comparePassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw AppError.badRequest('Invalid current password', 'INVALID_CREDENTIALS');
    }

    user.passwordHash = await this.hashPassword(newPassword);
    user.tokenVersion += 1;
    await user.save();

    return userSerializer.sanitizeUser(user);
  }

  async incrementTokenVersion(id, transaction = null) {
    const user = await User.findByPk(id, { transaction });
    if (user) {
      user.tokenVersion += 1;
      await user.save({ transaction });
    }
  }
}

module.exports = new UserCredentialsService();