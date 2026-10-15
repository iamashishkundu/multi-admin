const ticketAssignmentService = require('../services/ticket-assignment.service');
const { successResponse } = require('../../../common/response');

class TicketAssignmentController {
  async assignTicket(req, res, next) {
    try {
      const ticket = await ticketAssignmentService.assignTicket(req.params.id, req.body.assignedToId, req.user.id, req.ip, req.headers['user-agent']);
      return successResponse(res, 'Ticket assigned successfully', ticket);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TicketAssignmentController();