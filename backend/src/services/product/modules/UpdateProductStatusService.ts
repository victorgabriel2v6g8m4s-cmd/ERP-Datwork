import { type Product, ProductStatus, Prisma } from '@prisma/client';
import prismaClient from '../../../config/prisma.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { createProductSnapshot } from '../../../utils/product/ProductSnapshot.js';

export class UpdateProductStatusService {
  async execute(id: string, status: ProductStatus): Promise<Product> {
    CustomLogger.info(`Alterando status do produto ${id} para ${status}`);

    try {
      return await prismaClient.$transaction(async (tx) => {
        const updatedProduct = await tx.product.update({
          where: { id },
          data: { status }
        });

        await createProductSnapshot(tx, updatedProduct);
        CustomLogger.info(`Snapshot de status do produto ${id} persistido na mesma transação`);

        return updatedProduct;
      });

    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        CustomLogger.warn(`Tentativa de alteração de status falhou: Produto ID ${id} não encontrado`);
        throw new Error('ProductNotFoundException');
      }

      CustomLogger.error(`Falha ao alterar status do produto ${id}`, error);
      throw error;
    }
  }
}
