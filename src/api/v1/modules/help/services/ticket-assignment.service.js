const HelpTicket = require('../help-ticket.model');
const userAccountService = require('../../user/services/user-account.service');
const auditLogService = require('../../admin/services/audit-log.service');
const AppError = require('../../../common/AppError');

class TicketAssignmentService {
  async assignTicket(id, assignedToId, actorId, ipAddress = null, userAgent = null) {
    const ticket = await HelpTicket.findByPk(id);
    if (!ticket) throw AppError.notFound('Help ticket not found', 'TICKET_NOT_FOUND');
    const staff = await userAccountService.findById(assignedToId);
    if (!staff || (staff.role !== 'admin' && staff.role !== 'subadmin')) {
      throw AppError.badRequest('Ticket can only be assigned to an admin or sub-admin', 'INVALID_ASSIGNEE');
    }
    ticket.assignedToId = assignedToId;
    ticket.status = 'in_progress';
    await ticket.save();
    await auditLogService.log({
      actorId, action: 'TICKET_ASSIGN', module: 'help', targetId: ticket.id,
      details: { assignedToId, assignedToEmail: staff.email }, ipAddress, userAgent,
    });
    return ticket;
  }
}

module.exports = new TicketAssignmentService();