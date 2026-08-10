import { ProductStatus } from '@prisma/client';
import prismaClient from '../../../config/prisma.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { presentProduct } from '../../../presenters/product/ProductPresenter.js';
import { type ProductResponse } from '../../../contracts/product/ProductContract.js';

export class ListProductsService {
    async execute(): Promise<ProductResponse[]> {
        const products = await prismaClient.product.findMany({
            where: { status: ProductStatus.ACTIVE },
            orderBy: { position: 'asc' },
            include: {
                recipe: {
                    select: { unitsPerBatch: true }
                }
            }
        });

        CustomLogger.info(`[Products] Catálogo persistido carregado com ${products.length} registros ativos`);
        return products.map(presentProduct);
    }
}
