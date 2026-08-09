import type { Request, Response } from 'express';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { appointmentService } from '../../../services/appointment/AppointmentServiceHandler.js';
import {
  AppointmentRequestValidationError,
  parseAppointmentId,
  parseAppointmentStatus
} from '../utils/AppointmentRequestValidator.js';

export class UpdateAppointmentStatusController {
  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseAppointmentId(req.params.id);
      const body = req.body as { status?: unknown };
      const status = parseAppointmentStatus(body?.status);
      return res.status(200).json(await appointmentService.updateStatus.execute({ id, status }));
    } catch (error) {
      if (error instanceof AppointmentRequestValidationError) {
        return res.status(400).json({ error: error.message, field: error.field });
      }
      if (error instanceof Error && error.message === 'AppointmentNotFoundException') {
        return res.status(404).json({ error: 'O agendamento solicitado não foi encontrado.' });
      }
      CustomLogger.error('[Agenda] Failed to update appointment status', error);
      return res.status(500).json({ error: 'Erro interno ao atualizar o status do agendamento.' });
    }
  }
}
