import prismaClient from '../../../config/prisma.js';
import { Prisma } from '@prisma/client';
import { CustomLogger } from '../../../logger/CustomLogger.js';

interface MoveRequest {
  id: string;
  newPosition: number;
}

export class UpdateAppointmentOrderService {
  async execute({ id, newPosition }: MoveRequest): Promise<void> {
    CustomLogger.info(`Iniciando reordenação atômica Kanban do agendamento ${id} para posição ${newPosition}`);

    try {
      // ✨ Toda a esteira de validação e escrita unificada na transação (Isolamento total contra Race Conditions)
      await prismaClient.$transaction(async (tx) => {

        // 1. Busca e valida o agendamento diretamente de dentro da transação
        const target = await tx.appointment.findUnique({
          where: { id },
          select: { position: true } // Otimização: Traz apenas a posição atual
        });

        if (!target) throw new Prisma.PrismaClientKnownRequestError('', { code: 'P2025', clientVersion: '' });

        const oldPosition = target.position;

        // Se a posição não mudou de fato, encerra a transação sem operar no banco
        if (oldPosition === newPosition) return;

        // 2. ✨ Deslocamento Matemático Relativo em Bloco Otimizado
        if (oldPosition < newPosition) {
          // Movendo para baixo: decrementa quem ficou espremido no meio
          await tx.appointment.updateMany({
            where: { position: { gt: oldPosition, lte: newPosition }, status: { not: 'CANCELED' } },
            data: { position: { decrement: 1 } }
          });
        } else {
          // Movendo para cima: incrementa quem ficou espremido no meio
          await tx.appointment.updateMany({
            where: { position: { gte: newPosition, lt: oldPosition }, status: { not: 'CANCELED' } },
            data: { position: { increment: 1 } }
          });
        }

        // 3. Atualiza a posição definitiva do item arrastado
        await tx.appointment.update({
          where: { id },
          data: { position: newPosition }
        });
      });

      CustomLogger.info(`Reordenação Kanban concluída para o ID: ${id}`);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        CustomLogger.warn(`Falha na reordenação Kanban: Agendamento ID ${id} não encontrado`);
        throw new Error('AppointmentNotFoundException');
      }

      CustomLogger.error(`Erro crítico no Drag-and-Drop do agendamento ${id}`, error);
      throw error;
    }
  }
}
