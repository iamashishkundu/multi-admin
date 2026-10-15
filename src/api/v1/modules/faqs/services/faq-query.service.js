const Faq = require('../faq.model');
const { formatPaginatedResponse } = require('../../../common/pagination');

class FaqQueryService {
  async listFaqs(query, isPublic = true) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
    const where = {};
    if (isPublic) where.isPublished = true;
    else if (query.isPublished !== undefined) where.isPublished = query.isPublished === 'true' || query.isPublished === true;
    if (query.category) where.category = query.category;
    const { count, rows } = await Faq.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']],
    });
    return formatPaginatedResponse(rows, count, page, limit);
  }
}

module.exports = new FaqQueryService();