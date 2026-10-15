const HelpTicket = require('../help-ticket.model');
const AppError = require('../../../common/AppError');
const { formatPaginatedResponse } = require('../../../common/pagination');

class TicketQueryService {
  async createTicket({ userId, subject, description, priority }, actorId) {
    return HelpTicket.create({ userId, subject, description, priority: priority || 'medium', status: 'open' });
  }

  async getTicketById(id, requestingUser) {
    const ticket = await HelpTicket.findByPk(id);
    if (!ticket) throw AppError.notFound('Help ticket not found', 'TICKET_NOT_FOUND');
    if (requestingUser.role === 'user' && ticket.userId !== requestingUser.id) {
      throw AppError.forbidden('Access denied to requested ticket', 'FORBIDDEN');
    }
    return ticket;
  }

  async listTickets(query, requestingUser) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
    const where = {};
    if (requestingUser.role === 'user') where.userId = requestingUser.id;
    else if (query.userId) where.userId = query.userId;
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    const { count, rows } = await HelpTicket.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']],
    });
    return formatPaginatedResponse(rows, count, page, limit);
  }
}

module.exports = new TicketQueryService();