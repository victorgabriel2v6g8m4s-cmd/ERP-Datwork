import prismaClient from '../../../config/prisma.js';
import { type Appointment, AppointmentStatus, Prisma } from '@prisma/client';
import { CustomLogger } from '../../../logger/CustomLogger.js';

interface DeleteRequest {
  id: string;
}

export class DeleteAppointmentService {
  async execute({ id }: DeleteRequest): Promise<Appointment> {
    CustomLogger.info(`Solicitação de cancelamento seguro para o ID: ${id}`);

    try {
      // ✨ Otimização: Tenta atualizar diretamente sem fazer um "find" prévio
      // Nota: Certifique-se de que "CANCELED" foi adicionado ao enum AppointmentStatus do seu schema.prisma
      const canceledAppointment = await prismaClient.appointment.update({
        where: { id },
        data: {
          status: AppointmentStatus.CANCELED // ✨ Uso do Enum estrito do Prisma
        }
      });

      CustomLogger.info(`Agendamento ${id} marcado como CANCELADO com sucesso`);
      return canceledAppointment;
    } catch (error) {
      // ✨ Captura erro nativo do Prisma para registros não encontrados (Código P2025)
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        CustomLogger.warn(`Tentativa de cancelamento falhou: ID ${id} não encontrado`);
        throw new Error('AppointmentNotFoundException');
      }

      CustomLogger.error(`Erro ao aplicar cancelamento seguro no registro ${id}`, error);
      throw error;
    }
  }
}
