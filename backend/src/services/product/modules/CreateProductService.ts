import prismaClient from '../../../config/prisma.js';
import { AbcCategory, CostInclusion, ProductStatus } from '@prisma/client';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { type CreateProductRequest, type ProductResponse } from '../../../contracts/product/ProductContract.js';
import { presentProduct } from '../../../presenters/product/ProductPresenter.js';

export class CreateProductService {
    async execute({
        sku,
        name,
        brand,
        variation,
        thumbnail,
        description,
        medias,
        indirectCost,
        finalPrice,
        abcCategory,
        includeFixedCosts
    }: CreateProductRequest): Promise<ProductResponse> {
        CustomLogger.info('Iniciando cadastro de novo produto', { sku, name });

        const skuExists = await prismaClient.product.findUnique({
            where: { sku },
            select: { id: true }
        });

        if (skuExists) {
            CustomLogger.warn('Tentativa de cadastro com SKU duplicado', { sku });
            throw new Error('ProductAlreadyExistsException');
        }

        try {
            const createdProduct = await prismaClient.$transaction(async (tx) => {
                const lastProduct = await tx.product.findFirst({
                    orderBy: { position: 'desc' },
                    select: { position: true }
                });

                const nextPosition = lastProduct ? lastProduct.position + 1 : 0;
                const computedIndirectCost = indirectCost ?? 0;

                return tx.product.create({
                    data: {
                        sku,
                        name,
                        description: description || null,
                        brand: brand || 'Sem Marca',
                        variation: variation || null,
                        thumbnail: thumbnail || null,
                        medias: medias ?? [],
                        abcCategory: abcCategory ?? AbcCategory.C,
                        recipeCostPerUnit: 0,
                        indirectCost: computedIndirectCost,
                        totalUnitCost: computedIndirectCost,
                        suggestedPrice: 0,
                        finalPrice: finalPrice ?? 0,
                        predictedNetProfit: 0,
                        includeFixedCosts: includeFixedCosts ?? CostInclusion.DEFAULT,
                        position: nextPosition,
                        status: ProductStatus.ACTIVE
                    }
                });
            });

            return presentProduct(createdProduct);
        } catch (error) {
            CustomLogger.error('Falha ao registrar novo produto no banco de dados', error);
            throw error;
        }
    }
}
