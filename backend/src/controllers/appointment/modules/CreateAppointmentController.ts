import { type Request, type Response } from 'express';
// 🌟 Importa a instância centralizadora de serviços que criamos anteriormente
import { appointmentService } from '../../../services/appointment/AppointmentServiceHandler.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class CreateAppointmentController {
  async handle(req: Request, res: Response): Promise<Response> {
    CustomLogger.info('Recebendo requisição HTTP de criação de agendamento');

    const {
      title, time, createdAt, description, financials, medias,
      firstName, lastName, documentType, documentNumber, phone, email,
      cep, state, city, neighborhood, street, houseNumber, complement, referencePoint
    } = req.body;

    // Validação defensiva na camada de entrada (Controller)
    if (!title || !time || !createdAt) {
      CustomLogger.warn('Tentativa de criação rejeitada: campos obrigatórios ausentes');
      return res.status(400).json({ error: 'Os campos title, time e createdAt são obrigatórios.' });
    }

    try {
      // ✨ Otimização: Consome direto da instância Singleton, eliminando 'new Service()'
      const appointment = await appointmentService.create.execute({
        title, time, createdAt, description, financials, medias,
        firstName, lastName, documentType, documentNumber, phone, email,
        cep, state, city, neighborhood, street, houseNumber, complement, referencePoint
      });

      return res.status(201).json(appointment);
    } catch (error: any) {
      // Tratamento explícito de exceções de negócio lançadas pelo Service
      if (error.message === 'InvalidDateException') {
        return res.status(400).json({ error: 'O formato da data enviado pelo Wizard é inválido.' });
      }

      CustomLogger.error('Erro crítico não tratado ao criar agendamento', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
