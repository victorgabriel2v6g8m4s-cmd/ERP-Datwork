import { type Request, type Response } from 'express';
// 🌟 Acoplamento direto com o gerenciador de serviços centralizado
import { appointmentService } from '../../../services/appointment/AppointmentServiceHandler.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class UpdateSubStatusController {
    async handle(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        const { subStatus } = req.body;

        CustomLogger.info(`Recebendo requisição HTTP para alteração de sub-status do agendamento ${id} para: ${subStatus}`);

        // Validação defensiva na camada de entrada (Controller)
        if (!id || typeof id !== 'string') {
            CustomLogger.warn('Requisição de sub-status rejeitada: parâmetro ID ausente ou inválido');
            return res.status(400).json({ error: 'O parâmetro ID é obrigatório e deve ser uma string válida.' });
        }

        if (!subStatus || typeof subStatus !== 'string') {
            CustomLogger.warn(`Tentativa de alteração do agendamento ${id} com sub-status ausente ou inválido`);
            return res.status(400).json({ error: 'O campo subStatus é obrigatório e deve ser um texto válido.' });
        }

        try {
            // ✨ Otimização: Consome diretamente a instância unificada, eliminando 'new'
            const updatedAppointment = await appointmentService.updateSubStatus.execute({
                id,
                subStatus
            });

            return res.status(200).json(updatedAppointment);
        } catch (error: any) {
            if (error.message === 'AppointmentNotFoundException') {
                CustomLogger.warn(`Alteração de sub-status abortada na camada HTTP: Agendamento ${id} não existe`);
                return res.status(404).json({ error: 'O agendamento solicitado não foi encontrado no sistema.' });
            }

            CustomLogger.error(`Erro crítico não tratado ao alterar sub-status do agendamento ${id}`, error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
