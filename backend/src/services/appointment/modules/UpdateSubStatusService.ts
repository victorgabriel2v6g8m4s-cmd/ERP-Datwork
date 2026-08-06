import prismaClient from '../../../config/prisma.js';
import { Prisma } from '@prisma/client';
import { CustomLogger } from '../../../logger/CustomLogger.js';

interface UpdateSubStatusRequest {
    id: string;
    subStatus: string;
}

export class UpdateSubStatusService {
    async execute({ id, subStatus }: UpdateSubStatusRequest) {
        CustomLogger.info(`Atualizando sub-status do ID: ${id} para: ${subStatus}`);

        // ✨ Validação defensiva simples
        if (!id || !subStatus) {
            throw new Error('MissingRequiredFieldsException');
        }

        try {
            // ✨ Executa o update otimizado trazendo apenas as colunas necessárias
            return await prismaClient.appointment.update({
                where: { id },
                data: { subStatus },
                select: {
                    id: true,
                    status: true,
                    subStatus: true
                }
            });
        } catch (error) {
            // ✨ Captura o erro nativo de registro não encontrado no banco (Código P2025)
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                CustomLogger.warn(`Tentativa de alteração de sub-status falhou: ID ${id} não encontrado`);
                throw new Error('AppointmentNotFoundException');
            }

            CustomLogger.error(`Falha ao alterar sub-status do agendamento ${id}`, error);
            throw error;
        }
    }
}
