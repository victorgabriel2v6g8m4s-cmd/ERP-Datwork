import { type Request, type Response } from 'express';
// 🌟 Acoplamento direto com o gerenciador de serviços centralizado
import { appointmentService } from '../../../services/appointment/AppointmentServiceHandler.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class UpdateAppointmentController {
  async handle(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const {
      title, time, createdAt, subStatus, description, financials, medias,
      firstName, lastName, documentType, documentNumber, phone, email,
      cep, state, city, neighborhood, street, houseNumber, complement, referencePoint
    } = req.body;

    CustomLogger.info(`Recebendo requisição HTTP para atualização completa do agendamento ${id}`);

    if (!id || typeof id !== 'string') {
      CustomLogger.warn('Requisição de atualização rejeitada: parâmetro ID ausente ou inválido');
      return res.status(400).json({ error: 'O parâmetro ID é obrigatório e deve ser uma string válida.' });
    }

    if (!title || !time || !createdAt) {
      CustomLogger.warn(`Tentativa de atualização do agendamento ${id} sem campos obrigatórios`);
      return res.status(400).json({ error: 'Os campos title, time e createdAt são obrigatórios.' });
    }

    try {
      // ✨ Otimização: Consome diretamente a instância unificada, sem 'new'
      const updated = await appointmentService.update.execute({
        id, title, time, createdAt, subStatus, description, financials, medias,
        firstName, lastName, documentType, documentNumber, phone, email,
        cep, state, city, neighborhood, street, houseNumber, complement, referencePoint
      });

      // ✨ Mantém o fallback de visualização do subStatus padrão para o frontend do ERP
      return res.status(200).json({
        ...updated,
        subStatus: updated.subStatus || 'CONFIRMADO'
      });
    } catch (error: any) {
      if (error.message === 'AppointmentNotFoundException') {
        CustomLogger.warn(`Atualização abortada na camada HTTP: Agendamento ${id} não existe`);
        return res.status(404).json({ error: 'O agendamento solicitado não foi encontrado no sistema.' });
      }

      if (error.message === 'InvalidDateException') {
        return res.status(400).json({ error: 'O formato da data enviado para a atualização é inválido.' });
      }

      CustomLogger.error(`Erro crítico não tratado ao atualizar o agendamento ${id}`, error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
