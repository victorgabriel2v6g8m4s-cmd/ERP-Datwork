import prismaClient from '../../../config/prisma.js';
import { type Appointment, AppointmentStatus, Prisma } from '@prisma/client';
import { CustomLogger } from '../../../logger/CustomLogger.js';

interface StatusRequest {
  id: string;
  status: AppointmentStatus; // ✨ Sincronizado com o Enum estrito do Prisma (PENDING, COMPLETED, CANCELED)
}

export class UpdateAppointmentStatusService {
  async execute({ id, status }: StatusRequest): Promise<Appointment> {
    CustomLogger.info(`Atualizando status do ID: ${id} para ${status}`);

    try {
      // ✨ Otimização: Tenta atualizar diretamente sem fazer a query de find prévia
      return await prismaClient.appointment.update({
        where: { id },
        data: { status }
      });
    } catch (error) {
      // ✨ Captura o erro nativo de registro não encontrado no banco (Código P2025)
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        CustomLogger.warn(`Tentativa de alteração de status falhou: ID ${id} não encontrado`);
        throw new Error('AppointmentNotFoundException');
      }

      CustomLogger.error(`Falha ao alterar status do agendamento ${id}`, error);
      throw error;
    }
  }
}
