import prismaClient from '../../../config/prisma.js';
import { AbcCategory, CostInclusion, ProductStatus } from '@prisma/client';
import { CustomLogger } from '../../../logger/CustomLogger.js';

interface CreateProductRequest {
    sku: string;
    name: string;
    brand?: string;
    variation?: string;
    thumbnail?: string;
    description?: string;
    indirectCost?: number;
}

export class CreateProductService {
    async execute({ sku, name, brand, variation, thumbnail, description, indirectCost }: CreateProductRequest) {
        CustomLogger.info('Iniciando cadastro de novo produto', { sku, name });

        // 1. Verifica duplicidade de SKU no banco (Pode ser feito antes ou dentro da transação)
        const skuExists = await prismaClient.product.findUnique({
            where: { sku },
            select: { id: true } // Otimização: Traz apenas o id para checagem rápida
        });
        if (skuExists) {
            CustomLogger.warn('Tentativa de cadastro com SKU duplicado', { sku });
            throw new Error('ProductAlreadyExistsException');
        }

        try {
            // ✨ Uso de transação para mitigar concorrência na geração da 'position'
            return await prismaClient.$transaction(async (tx) => {
                // 2. Encontra a próxima posição na fila linear tátil
                const lastProduct = await tx.product.findFirst({
                    orderBy: { position: 'desc' },
                    select: { position: true }
                });

                const nextPosition = lastProduct ? lastProduct.position + 1 : 0;
                const computedIndirectCost = indirectCost ? Number(indirectCost) : 0;

                // 💾 3. Insere o produto mapeado com os Enums do novo Schema
                return await tx.product.create({
                    data: {
                        sku,
                        name,
                        description: description || null,
                        brand: brand || 'Sem Marca',
                        variation: variation || null,
                        thumbnail: thumbnail || null,
                        abcCategory: AbcCategory.C, // ✨ Enum estrito

                        // 🧮 Campos Unificados de Engenharia de Custos
                        recipeCostPerUnit: 0,
                        indirectCost: computedIndirectCost,
                        totalUnitCost: computedIndirectCost, // Inicialmente igual ao indireto até vincular receita

                        suggestedPrice: 0,
                        finalPrice: 0,
                        predictedNetProfit: 0,
                        includeFixedCosts: CostInclusion.DEFAULT, // ✨ Enum estrito

                        position: nextPosition,
                        status: ProductStatus.ACTIVE // ✨ Enum estrito
                    }
                });
            });
        } catch (error) {
            CustomLogger.error('Falha ao registrar novo produto no banco de dados', error);
            throw error;
        }
    }
}
