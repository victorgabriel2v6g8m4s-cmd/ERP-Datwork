import prismaClient from '../../../config/prisma.js';
import { type Ingredient, Prisma } from '@prisma/client';
import { CustomLogger } from '../../../logger/CustomLogger.js';

interface UpdateIngredientRequest {
    id: string;
    sku?: string;
    name?: string;
    price?: number;
    quantity?: number;
    unit?: string;
    thumbnail?: string | null;
    medias?: any; // ✨ Alterado para any para aceitar estruturas JSON nativas do novo Schema
}

export class UpdateIngredientService {
    async execute(data: UpdateIngredientRequest): Promise<Ingredient> {
        CustomLogger.info(`Atualizando insumo ID: ${data.id}`);

        try {
            // 🛠️ Monta o objeto de dados dinamicamente para respeitar o exactOptionalPropertyTypes
            const updateData: Prisma.IngredientUpdateInput = {};

            if (data.sku !== undefined) updateData.sku = data.sku.trim().toUpperCase();
            if (data.name !== undefined) updateData.name = data.name.trim();
            if (data.unit !== undefined) updateData.unit = data.unit;
            if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
            if (data.medias !== undefined) updateData.medias = data.medias;

            // Tratamento preventivo de conversão numérica contra NaN
            if (data.price !== undefined) {
                const parsedPrice = Number(data.price);
                if (!isNaN(parsedPrice)) updateData.price = parsedPrice;
            }
            if (data.quantity !== undefined) {
                const parsedQuantity = Number(data.quantity);
                if (!isNaN(parsedQuantity)) updateData.quantity = parsedQuantity;
            }

            // 1. ✨ Otimização: Tenta atualizar diretamente economizando uma query de busca prévia
            const updated = await prismaClient.ingredient.update({
                where: { id: data.id },
                data: updateData
            });

            // 📜 2. Congela o instantâneo histórico (Snapshot) usando JSON nativo
            try {
                await prismaClient.ingredientVersion.create({
                    data: {
                        ingredientId: updated.id,
                        snapshotData: updated as any, // ✨ Passa o objeto JavaScript puro direto para o banco
                        versionDate: updated.updatedAt // Sincronismo perfeito com o horário da alteração
                    }
                });
            } catch (historyError: any) {
                // Se apenas o histórico falhar, não quebra a experiência do usuário
                console.error('⚠️ Aviso: Falha ao congelar snapshot histórico do insumo:', historyError.message);
            }

            return updated;

        } catch (error) {
            // ✨ Captura o erro conhecido do Prisma para ID não encontrado (Código P2025)
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                CustomLogger.warn(`Falha na atualização: Insumo ID ${data.id} não encontrado`);
                throw new Error('IngredientNotFoundException');
            }

            CustomLogger.error(`Falha crítica ao atualizar dados do insumo ${data.id}`, error);
            throw error;
        }
    }
}
