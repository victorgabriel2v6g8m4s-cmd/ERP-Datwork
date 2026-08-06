import { type Request, type Response } from 'express';
import { appointmentService } from '../../../services/appointment/AppointmentServiceHandler.js';
import { type AppointmentStatus } from '@prisma/client';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class ListAppointmentsController {
  async handle(req: Request, res: Response): Promise<Response> {
    CustomLogger.info('Recebendo requisição HTTP de listagem da fila de agendamentos');

    // ✨ Ativa a feature que adicionamos no Service: permite filtrar por query params na URL (ex: ?status=PENDING)
    const { status } = req.query;

    try {
      const appointments = await appointmentService.list.execute(
        status ? { status: status as AppointmentStatus } : undefined
      );

      return res.status(200).json(appointments);
    } catch (error) {
      CustomLogger.error('Erro crítico ao listar agendamentos na camada HTTP', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
