const ticketResolutionService = require('../services/ticket-resolution.service');
const { successResponse } = require('../../../common/response');

class TicketResolutionController {
  async resolveTicket(req, res, next) {
    try {
      const ticket = await ticketResolutionService.resolveTicket(req.params.id, req.body.resolutionNote, req.user.id, req.ip, req.headers['user-agent']);
      return successResponse(res, 'Ticket resolved successfully', ticket);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TicketResolutionController();