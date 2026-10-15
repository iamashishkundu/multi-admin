const ticketQueryService = require('../services/ticket-query.service');
const { successResponse, createdResponse } = require('../../../common/response');

class TicketQueryController {
  async createTicket(req, res, next) {
    try {
      const ticket = await ticketQueryService.createTicket({
        userId: req.user.id,
        subject: req.body.subject,
        description: req.body.description,
        priority: req.body.priority,
      }, req.user.id);
      return createdResponse(res, 'Help ticket created successfully', ticket);
    } catch (err) {
      next(err);
    }
  }

  async listTickets(req, res, next) {
    try {
      const { rows, pagination } = await ticketQueryService.listTickets(req.query, req.user);
      return successResponse(res, 'Help tickets retrieved successfully', rows, 200, pagination);
    } catch (err) {
      next(err);
    }
  }

  async getTicketById(req, res, next) {
    try {
      const ticket = await ticketQueryService.getTicketById(req.params.id, req.user);
      return successResponse(res, 'Help ticket retrieved successfully', ticket);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TicketQueryController();