import type { Request, Response } from 'express';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { appointmentService } from '../../../services/appointment/AppointmentServiceHandler.js';
import {
  AppointmentRequestValidationError,
  parseAppointmentUpdate
} from '../utils/AppointmentRequestValidator.js';

export class UpdateAppointmentController {
  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const payload = parseAppointmentUpdate(req.params.id, req.body as unknown);
      return res.status(200).json(await appointmentService.update.execute(payload));
    } catch (error) {
      if (error instanceof AppointmentRequestValidationError) {
        return res.status(400).json({ error: error.message, field: error.field });
      }
      if (error instanceof Error && error.message === 'AppointmentNotFoundException') {
        return res.status(404).json({ error: 'O agendamento solicitado não foi encontrado.' });
      }
      CustomLogger.error('[Agenda] Failed to update appointment', error);
      return res.status(500).json({ error: 'Erro interno ao atualizar o agendamento.' });
    }
  }
}
