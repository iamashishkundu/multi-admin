const HelpTicket = require('../help-ticket.model');
const auditLogService = require('../../admin/services/audit-log.service');
const AppError = require('../../../common/AppError');

class TicketResolutionService {
  async resolveTicket(id, resolutionNote, actorId, ipAddress = null, userAgent = null) {
    const ticket = await HelpTicket.findByPk(id);
    if (!ticket) throw AppError.notFound('Help ticket not found', 'TICKET_NOT_FOUND');
    ticket.status = 'resolved';
    ticket.resolutionNote = resolutionNote;
    await ticket.save();
    await auditLogService.log({
      actorId, action: 'TICKET_RESOLVE', module: 'help', targetId: ticket.id,
      details: { resolutionNote }, ipAddress, userAgent,
    });
    return ticket;
  }
}

module.exports = new TicketResolutionService();