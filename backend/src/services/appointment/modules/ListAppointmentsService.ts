import prismaClient from '../../../config/prisma.js';
import { type Appointment, AppointmentStatus, Prisma } from '@prisma/client';
import { CustomLogger } from '../../../logger/CustomLogger.js';

interface ListFilterRequest {
  status?: AppointmentStatus;
}

export class ListAppointmentsService {
  async execute(filter?: ListFilterRequest): Promise<Appointment[]> {
    CustomLogger.info('Buscando fila de agendamentos ativa', { filter });

    try {
      // 🛠️ Monta o objeto de filtro dinamicamente para respeitar o exactOptionalPropertyTypes
      const whereCondition: Prisma.AppointmentWhereInput = {};

      if (filter?.status) {
        whereCondition.status = filter.status;
      }

      // ✨ Retorna ordenado pela posição do Drag-and-Drop
      return await prismaClient.appointment.findMany({
        where: whereCondition,
        orderBy: {
          position: 'asc'
        }
      });
    } catch (error) {
      CustomLogger.error('Erro ao listar agendamentos do banco de dados', error);
      throw new Error('DatabaseFetchException');
    }
  }
}
