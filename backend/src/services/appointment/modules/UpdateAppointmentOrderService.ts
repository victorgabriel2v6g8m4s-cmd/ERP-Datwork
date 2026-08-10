import { AppointmentStatus, Prisma } from '@prisma/client';
import prismaClient from '../../../config/prisma.js';
import type { AppointmentOrderInput } from '../../../contracts/appointment/AppointmentContract.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class UpdateAppointmentOrderService {
  async execute({ id, newPosition }: AppointmentOrderInput): Promise<void> {
    CustomLogger.info(`Iniciando reordenação atômica Kanban do agendamento ${id} para posição ${newPosition}`);

    if (
      typeof id !== 'string' ||
      !id.trim() ||
      id !== id.trim() ||
      !Number.isInteger(newPosition) ||
      newPosition < 0
    ) {
      throw new Error('AppointmentReorderMismatch');
    }

    try {
      await prismaClient.$transaction(async (tx) => {
        const queue = await tx.appointment.findMany({
          where: { status: { not: AppointmentStatus.CANCELED } },
          orderBy: [{ position: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
          select: { id: true, position: true }
        });
        const targetIndex = queue.findIndex((appointment) => appointment.id === id);

        if (targetIndex < 0) {
          throw new Error('AppointmentNotFoundException');
        }
        if (newPosition >= queue.length) {
          throw new Error('AppointmentReorderMismatch');
        }

        const [target] = queue.splice(targetIndex, 1);
        if (!target) throw new Error('AppointmentNotFoundException');
        queue.splice(newPosition, 0, target);

        for (const [position, appointment] of queue.entries()) {
          if (appointment.position !== position) {
            await tx.appointment.update({
              where: { id: appointment.id },
              data: { position }
            });
          }
        }
      });

      CustomLogger.info(`Reordenação Kanban concluída para o ID: ${id}`);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        CustomLogger.warn(`Falha na reordenação Kanban: Agendamento ID ${id} não encontrado`);
        throw new Error('AppointmentNotFoundException');
      }

      if (error instanceof Error && (
        error.message === 'AppointmentNotFoundException' ||
        error.message === 'AppointmentReorderMismatch'
      )) {
        throw error;
      }

      CustomLogger.error(`Erro crítico no Drag-and-Drop do agendamento ${id}`, error);
      throw error;
    }
  }
}
