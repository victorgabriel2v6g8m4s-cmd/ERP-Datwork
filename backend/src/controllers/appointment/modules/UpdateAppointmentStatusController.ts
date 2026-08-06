import { type Request, type Response } from 'express';
// 🌟 Acoplamento direto com o gerenciador de serviços centralizado e enums do Prisma
import { appointmentService } from '../../../services/appointment/AppointmentServiceHandler.js';
import { AppointmentStatus } from '@prisma/client';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class UpdateAppointmentStatusController {
  async handle(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { status } = req.body;

    CustomLogger.info(`Recebendo requisição HTTP para alteração rápida de status do agendamento ${id} para ${status}`);

    if (!id || typeof id !== 'string') {
      CustomLogger.warn('Requisição de status rejeitada: parâmetro ID ausente ou inválido');
      return res.status(400).json({ error: 'O parâmetro ID é obrigatório e deve ser uma string válida.' });
    }

    // ✨ Sincronização com o Enum estrito do Prisma (PENDING, COMPLETED, CANCELED)
    if (status !== AppointmentStatus.PENDING && status !== AppointmentStatus.COMPLETED && status !== AppointmentStatus.CANCELED) {
      CustomLogger.warn(`Tentativa de injeção de status inválido na API: ${status}`);
      return res.status(400).json({ error: 'Status inválido. Escolha entre PENDING, COMPLETED ou CANCELED.' });
    }

    try {
      // ✨ Otimização: Consome diretamente a instância unificada, sem 'new'
      const updated = await appointmentService.updateStatus.execute({
        id,
        status: status as AppointmentStatus
      });

      return res.status(200).json(updated);
    } catch (error: any) {
      if (error.message === 'AppointmentNotFoundException') {
        CustomLogger.warn(`Alteração de status abortada na camada HTTP: Agendamento ${id} não existe`);
        return res.status(404).json({ error: 'O agendamento solicitado não foi encontrado no sistema.' });
      }

      CustomLogger.error(`Erro crítico não tratado ao alterar status do agendamento ${id}`, error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
