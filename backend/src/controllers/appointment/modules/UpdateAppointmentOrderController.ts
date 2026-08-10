import type { Request, Response } from 'express';
import { appointmentService } from '../../../services/appointment/AppointmentServiceHandler.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import {
    AppointmentRequestValidationError,
    parseAppointmentOrder
} from '../utils/AppointmentRequestValidator.js';

export class UpdateAppointmentOrderController {
    async handle(req: Request, res: Response): Promise<Response> {
        try {
            const payload = parseAppointmentOrder(req.params.id, req.body as unknown);
            CustomLogger.info(
                `Recebendo requisição HTTP para reordenação Kanban do agendamento ${payload.id} para posição ${payload.newPosition}`
            );
            await appointmentService.updateOrder.execute(payload);

            return res.status(204).send();
        } catch (error: unknown) {
            if (error instanceof AppointmentRequestValidationError) {
                CustomLogger.warn('[Agenda] Reorder rejected because the request payload is invalid', {
                    field: error.field,
                    reason: error.message
                });
                return res.status(400).json({ error: error.message, field: error.field });
            }
            if (error instanceof Error && error.message === 'AppointmentReorderMismatch') {
                return res.status(400).json({ error: 'A posição informada não pertence à fila atual de agendamentos.' });
            }
            if (error instanceof Error && error.message === 'AppointmentNotFoundException') {
                CustomLogger.warn('Reordenação Kanban abortada: agendamento não encontrado na fila ativa');
                return res.status(404).json({ error: 'O agendamento solicitado não foi encontrado no sistema.' });
            }

            CustomLogger.error('Erro crítico não tratado ao reordenar agendamento no Kanban', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
