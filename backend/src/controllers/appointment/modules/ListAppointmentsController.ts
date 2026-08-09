import type { Request, Response } from 'express';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { appointmentService } from '../../../services/appointment/AppointmentServiceHandler.js';
import {
  AppointmentRequestValidationError,
  parseAppointmentListStatus
} from '../utils/AppointmentRequestValidator.js';

export class ListAppointmentsController {
  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const status = parseAppointmentListStatus(req.query.status);
      const appointments = await appointmentService.list.execute(status ? { status } : undefined);
      return res.status(200).json(appointments);
    } catch (error) {
      if (error instanceof AppointmentRequestValidationError) {
        return res.status(400).json({ error: error.message, field: error.field });
      }
      CustomLogger.error('[Agenda] Failed to list appointments', error);
      return res.status(500).json({ error: 'Erro interno ao carregar a agenda.' });
    }
  }
}
