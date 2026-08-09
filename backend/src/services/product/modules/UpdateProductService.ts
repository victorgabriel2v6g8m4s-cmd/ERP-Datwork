import prismaClient from '../../../config/prisma.js';
import { PricingEngine } from '../../../math/PricingEngine.js';
import { Prisma } from '@prisma/client';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { type ProductResponse, type UpdateProductRequest } from '../../../contracts/product/ProductContract.js';
import { presentProduct } from '../../../presenters/product/ProductPresenter.js';

export class UpdateProductService {
    async execute(data: UpdateProductRequest): Promise<ProductResponse> {
        CustomLogger.info(`Iniciando solicitação de atualização do produto ID: ${data.id}`);

        if (data.sku) {
            const skuDuplicated = await prismaClient.product.findUnique({
                where: { sku: data.sku },
                select: { id: true }
            });

            if (skuDuplicated && skuDuplicated.id !== data.id) {
                CustomLogger.warn(`Tentativa de alteração para SKU já existente: ${data.sku}`);
                throw new Error('ProductSkuAlreadyExistsException');
            }
        }

        try {
            const updateData: Prisma.ProductUpdateInput = {};

            if (data.sku !== undefined) updateData.sku = data.sku;
            if (data.name !== undefined) updateData.name = data.name;
            if (data.brand !== undefined) updateData.brand = data.brand;
            if (data.variation !== undefined) updateData.variation = data.variation;
            if (data.description !== undefined) updateData.description = data.description;
            if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
            if (data.medias !== undefined) updateData.medias = data.medias;
            if (data.abcCategory !== undefined) updateData.abcCategory = data.abcCategory;
            if (data.includeFixedCosts !== undefined) updateData.includeFixedCosts = data.includeFixedCosts;
            if (data.indirectCost !== undefined) updateData.indirectCost = data.indirectCost;
            if (data.finalPrice !== undefined) updateData.finalPrice = data.finalPrice;

            await prismaClient.product.update({
                where: { id: data.id },
                data: updateData
            });

            CustomLogger.info(`Produto ${data.id} atualizado com sucesso. Disparando motor de precificação.`);
            await PricingEngine.recalculateAll();

            const synchronizedProduct = await prismaClient.product.findUnique({
                where: { id: data.id },
                include: {
                    recipe: {
                        select: { unitsPerBatch: true }
                    }
                }
            });

            if (!synchronizedProduct) {
                CustomLogger.warn(`Produto ${data.id} desapareceu antes da leitura pós-recálculo`);
                throw new Error('ProductNotFoundException');
            }

            return presentProduct(synchronizedProduct);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                CustomLogger.warn(`Falha na atualização: Produto ID ${data.id} não encontrado`);
                throw new Error('ProductNotFoundException');
            }

            CustomLogger.error(`Falha crítica ao atualizar dados do produto ${data.id}`, error);
            throw error;
        }
    }
}
