import type { Request, Response } from 'express';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { appointmentService } from '../../../services/appointment/AppointmentServiceHandler.js';
import {
  AppointmentRequestValidationError,
  parseAppointmentCascade
} from '../utils/AppointmentRequestValidator.js';

export class CascadeRescheduleController {
  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const payload = parseAppointmentCascade(req.body as unknown);
      return res.status(200).json(await appointmentService.cascadeReschedule.execute(payload));
    } catch (error) {
      if (error instanceof AppointmentRequestValidationError) {
        return res.status(400).json({ error: error.message, field: error.field });
      }
      if (error instanceof Error && error.message === 'AppointmentNotFoundException') {
        return res.status(404).json({ error: 'Um dos agendamentos da cascata não foi encontrado.' });
      }
      CustomLogger.error('[Agenda] Cascade reschedule failed', error);
      return res.status(500).json({ error: 'Erro interno ao processar o reagendamento em cascata.' });
    }
  }
}
