import { type Request, type Response } from 'express';
// 🌟 Acoplamento direto com o gerenciador de serviços centralizado
import { appointmentService } from '../../../services/appointment/AppointmentServiceHandler.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class DeleteAppointmentController {
  async handle(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    CustomLogger.info(`Recebendo requisição HTTP para cancelamento seguro do ID: ${id}`);

    if (!id || typeof id !== 'string') {
      CustomLogger.warn('Requisição de cancelamento rejeitada: parâmetro ID ausente ou inválido');
      return res.status(400).json({ error: 'O parâmetro ID é obrigatório e deve ser uma string válida.' });
    }

    try {
      // ✨ Otimização: Consome diretamente a instância unificada, sem 'new'
      const appointment = await appointmentService.delete.execute({ id });

      return res.status(200).json(appointment);
    } catch (error: any) {
      if (error.message === 'AppointmentNotFoundException') {
        CustomLogger.warn(`Cancelamento abortado na camada HTTP: Agendamento ${id} não existe`);
        return res.status(404).json({ error: 'O agendamento solicitado não foi encontrado no sistema.' });
      }

      CustomLogger.error(`Erro crítico não tratado ao cancelar agendamento ${id}`, error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
