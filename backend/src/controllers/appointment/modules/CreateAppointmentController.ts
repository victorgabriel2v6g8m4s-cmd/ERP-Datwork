import type { Request, Response } from 'express';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { appointmentService } from '../../../services/appointment/AppointmentServiceHandler.js';
import {
  AppointmentRequestValidationError,
  parseAppointmentCreate
} from '../utils/AppointmentRequestValidator.js';

export class CreateAppointmentController {
  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const payload = parseAppointmentCreate(req.body as unknown);
      return res.status(201).json(await appointmentService.create.execute(payload));
    } catch (error) {
      if (error instanceof AppointmentRequestValidationError) {
        CustomLogger.warn(`[Agenda] Create rejected for ${error.field}: ${error.message}`);
        return res.status(400).json({ error: error.message, field: error.field });
      }
      CustomLogger.error('[Agenda] Failed to create appointment', error);
      return res.status(500).json({ error: 'Erro interno ao criar o agendamento.' });
    }
  }
}
