const { Op } = require('sequelize');
const User = require('../user.model');
const { formatPaginatedResponse } = require('../../../common/pagination');

class UserListService {
  async listUsers({ page = 1, limit = 10, role, isActive, search, sortBy = 'createdAt', sortOrder = 'DESC' }) {
    const offset = (page - 1) * limit;
    const where = {};

    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true' || isActive === true;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy, sortOrder.toUpperCase()]],
      attributes: { exclude: ['passwordHash'] },
    });

    return formatPaginatedResponse(rows, count, page, limit);
  }
}

module.exports = new UserListService();