import prismaClient from '../../../config/prisma.js';
import { type Ingredient, ProductStatus, Prisma } from '@prisma/client';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { createSnapshot } from '../../../utils/snapshotAuditor.js';

export class UpdateIngredientStatusService {
    async execute(id: string, status: ProductStatus): Promise<Ingredient> {
        CustomLogger.info(`Alterando status do insumo ${id} para ${status}`);

        try {
            return await prismaClient.$transaction(async (tx) => {
                // 1. Otimização: Tenta atualizar o status direto
                const updatedIngredient = await tx.ingredient.update({
                    where: { id },
                    data: { status }
                });

                // 📜 2. ✨ Reaproveita o assistente de auditoria universal de forma limpa e atômica
                await createSnapshot('ingredientVersion', 'ingredientId', updatedIngredient.id, updatedIngredient);

                return updatedIngredient;
            });

        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                CustomLogger.warn(`Tentativa de alteração de status falhou: Insumo ID ${id} não encontrado`);
                throw new Error('IngredientNotFoundException');
            }

            CustomLogger.error(`Falha ao alterar status do insumo ${id}`, error);
            throw error;
        }
    }
}
