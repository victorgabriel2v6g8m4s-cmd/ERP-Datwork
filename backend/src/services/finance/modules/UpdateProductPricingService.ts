import prismaClient from '../../../config/prisma.js';
import { PricingEngine } from '../../../math/PricingEngine.js';
import { CostInclusion, Prisma } from '@prisma/client';
import { CustomLogger } from '../../../logger/CustomLogger.js';

interface UpdatePricingRequest {
    id: string;
    finalPrice?: number;
    includeFixedCosts?: CostInclusion; // ✨ Sincronizado com o Enum do Schema
}

export class UpdateProductPricingService {
    async execute({ id, finalPrice, includeFixedCosts }: UpdatePricingRequest) {
        CustomLogger.info(`Atualizando precificação do produto ID: ${id}`);

        try {
            // 🛠️ Monta o objeto dinamicamente para respeitar o exactOptionalPropertyTypes
            const updateData: Prisma.ProductUpdateInput = {};

            if (includeFixedCosts !== undefined) {
                updateData.includeFixedCosts = includeFixedCosts;
            }

            if (finalPrice !== undefined) {
                updateData.finalPrice = Number(finalPrice);
            }

            // ✨ Otimização: Tenta atualizar diretamente economizando uma query no banco
            await prismaClient.product.update({
                where: { id },
                data: updateData
            });

            CustomLogger.info(`Precificação do produto ${id} atualizada. Acionando motor PricingEngine.`);

            // 🧮 Recalcula na hora o lucro líquido físico com base no novo preço praticado
            await PricingEngine.recalculateAll();

        } catch (error) {
            // ✨ Captura o erro nativo do Prisma para ID inexistente (Código P2025)
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                CustomLogger.warn(`Falha na atualização de preços: Produto ID ${id} não encontrado`);
                throw new Error('ProductNotFoundException');
            }

            CustomLogger.error(`Falha crítica ao atualizar precificação do produto ${id}`, error);
            throw error;
        }
    }
}
