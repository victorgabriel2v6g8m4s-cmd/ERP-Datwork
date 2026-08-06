import prismaClient from '../../../config/prisma.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';

interface CascadePayload {
    appointmentIds: string[];
    offsetValue: number;
    unit: 'MINUTES' | 'HOURS' | 'DAYS' | 'WEEKS' | 'MONTHS';
    newPosition: number;
    targetId: string;
    actionType: 'POSTERIOR' | 'ANTERIOR';
}

export class CascadeRescheduleService {
    async execute({ appointmentIds, offsetValue, unit, newPosition, targetId, actionType }: CascadePayload) {
        if (!targetId || appointmentIds.length === 0 || offsetValue <= 0) return;

        CustomLogger.info(`Iniciando cascata temporal [${actionType}] para o item alvo: ${targetId}`);

        const unitMap = {
            MINUTES: 60 * 1000,
            HOURS: 60 * 60 * 1000,
            DAYS: 24 * 60 * 60 * 1000,
            WEEKS: 7 * 24 * 60 * 60 * 1000,
            MONTHS: 30 * 24 * 60 * 60 * 1000,
        };

        const directionSign = actionType === 'ANTERIOR' ? -1 : 1;
        const totalOffsetMs = offsetValue * unitMap[unit] * directionSign;

        try {
            return await prismaClient.$transaction(async (tx) => {
                // 1. Atualiza a nova posição física do item arrastado
                await tx.appointment.update({
                    where: { id: targetId },
                    data: { position: newPosition }
                });

                // 2. REORDENAÇÃO EM CADEIA OTIMIZADA
                const allAppointments = await tx.appointment.findMany({
                    where: { status: { not: 'CANCELED' } },
                    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
                    select: { id: true, position: true } // ✨ Traz apenas o estritamente necessário
                });

                // ✨ Otimização: Só executa o update se a posição real no banco estiver desalinhada
                const reorderPromises = allAppointments
                    .map((apt, index) => {
                        if (apt.position === index) return null; // Evita queries inúteis
                        return tx.appointment.update({
                            where: { id: apt.id },
                            data: { position: index }
                        });
                    })
                    .filter(Boolean);

                await Promise.all(reorderPromises);

                // 3. DESLOCAMENTO TEMPORAL INTELIGENTE (Batch Fetching)
                // ✨ Otimização Crítica: Busca todos os alvos de uma vez só fora do loop
                const targetAppointments = await tx.appointment.findMany({
                    where: { id: { in: appointmentIds } }
                });

                const updateTimePromises = targetAppointments.map((appointment) => {
                    const currentTimestamp = new Date(appointment.createdAt).getTime();
                    const nextTimestamp = new Date(currentTimestamp + totalOffsetMs);
                    const isoStringResult = nextTimestamp.toISOString();

                    const formatHours = String(nextTimestamp.getHours()).padStart(2, '0');
                    const formatMinutes = String(nextTimestamp.getMinutes()).padStart(2, '0');
                    const nextTimeField = `${formatHours}:${formatMinutes}`;

                    return tx.appointment.update({
                        where: { id: appointment.id },
                        data: {
                            createdAt: isoStringResult,
                            time: nextTimeField
                        }
                    });
                });

                await Promise.all(updateTimePromises);

                CustomLogger.info(`Cascata finalizada com sucesso. Itens afetados: ${appointmentIds.length}`);
            });
        } catch (error) {
            CustomLogger.error('Falha crítica ao processar o reagendamento em cascata', error);
            throw error;
        }
    }
}
