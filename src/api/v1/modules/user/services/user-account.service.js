const { Op } = require('sequelize');
const User = require('../user.model');
const AppError = require('../../../common/AppError');
const userCredentials = require('./user-credentials.service');
const userSerializer = require('./user-serializer.service');

class UserAccountService {
  async createUser({ name, email, password, role = 'user', isActive = true }, transaction = null) {
    const existing = await User.findOne({
      where: { email: email.toLowerCase() },
      paranoid: false,
      transaction,
    });

    if (existing) {
      throw AppError.conflict('A user with this email address already exists.', 'EMAIL_ALREADY_EXISTS');
    }

    const passwordHash = await userCredentials.hashPassword(password);
    const user = await User.create(
      {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role,
        isActive,
        tokenVersion: 1,
      },
      { transaction }
    );

    return userSerializer.sanitizeUser(user);
  }

  async findById(id, { includePassword = false, transaction = null } = {}) {
    const user = await User.findByPk(id, { transaction });
    if (!user) {
      throw AppError.notFound('User not found', 'USER_NOT_FOUND');
    }
    return includePassword ? user : userSerializer.sanitizeUser(user);
  }

  async findByEmail(email, { includePassword = false, transaction = null } = {}) {
    const user = await User.findOne({
      where: { email: email.toLowerCase() },
      transaction,
    });
    if (!user) return null;
    return includePassword ? user : userSerializer.sanitizeUser(user);
  }

  async updateUser(id, updateData, transaction = null) {
    const user = await User.findByPk(id, { transaction });
    if (!user) {
      throw AppError.notFound('User not found', 'USER_NOT_FOUND');
    }

    if (updateData.email && updateData.email.toLowerCase() !== user.email) {
      const existing = await User.findOne({
        where: { email: updateData.email.toLowerCase(), id: { [Op.ne]: id } },
        paranoid: false,
        transaction,
      });
      if (existing) {
        throw AppError.conflict('Email is already taken by another account', 'EMAIL_ALREADY_EXISTS');
      }
      user.email = updateData.email.toLowerCase();
    }

    if (updateData.name) user.name = updateData.name;
    if (typeof updateData.isActive === 'boolean') user.isActive = updateData.isActive;
    if (updateData.password) {
      user.passwordHash = await userCredentials.hashPassword(updateData.password);
      user.tokenVersion += 1;
    }

    await user.save({ transaction });
    return userSerializer.sanitizeUser(user);
  }

  async deleteUser(id, transaction = null) {
    const user = await User.findByPk(id, { transaction });
    if (!user) {
      throw AppError.notFound('User not found', 'USER_NOT_FOUND');
    }
    user.isActive = false;
    user.tokenVersion += 1;
    await user.save({ transaction });
    await user.destroy({ transaction });
    return true;
  }
}

module.exports = new UserAccountService();