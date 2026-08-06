import { type Request, type Response } from 'express';
// 🌟 Acoplamento direto com o gerenciador de serviços centralizado
import { appointmentService } from '../../../services/appointment/AppointmentServiceHandler.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class UpdateAppointmentOrderController {
    async handle(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        const { newPosition } = req.body;

        CustomLogger.info(`Recebendo requisição HTTP para reordenação Kanban do agendamento ${id} para posição ${newPosition}`);

        if (!id || typeof id !== 'string') {
            CustomLogger.warn('Requisição de reordenação Kanban rejeitada: parâmetro ID ausente ou inválido');
            return res.status(400).json({ error: 'O parâmetro ID é obrigatório e deve ser uma string válida.' });
        }

        if (newPosition === undefined || isNaN(Number(newPosition))) {
            CustomLogger.warn(`Tentativa de reordenação do agendamento ${id} sem uma posição numérica válida`);
            return res.status(400).json({ error: 'O campo newPosition é obrigatório e deve ser um número válido.' });
        }

        try {
            // ✨ Otimização: Consome diretamente a instância unificada, sem 'new'
            await appointmentService.updateOrder.execute({
                id,
                newPosition: Number(newPosition)
            });

            return res.status(204).send();
        } catch (error: any) {
            if (error.message === 'AppointmentNotFoundException') {
                CustomLogger.warn(`Reordenação Kanban abortada na camada HTTP: Agendamento ${id} não existe`);
                return res.status(404).json({ error: 'O agendamento solicitado não foi encontrado no sistema.' });
            }

            CustomLogger.error(`Erro crítico não tratado ao reordenar agendamento ${id} no Kanban`, error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
