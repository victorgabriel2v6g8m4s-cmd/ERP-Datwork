import prismaClient from '../../../config/prisma.js';
import { type Product, ProductStatus, Prisma } from '@prisma/client';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { createSnapshot } from '../../../utils/snapshotAuditor.js';

export class UpdateProductStatusService {
  async execute(id: string, status: ProductStatus): Promise<Product> {
    CustomLogger.info(`Alterando status do produto ${id} para ${status}`);

    try {
      // Uso de transação para garantir consistência total
      return await prismaClient.$transaction(async (tx) => {

        // 1. Otimização Crítica: Executa o update direto economizando I/O
        const updatedProduct = await tx.product.update({
          where: { id },
          data: { status }
        });

        // 📜 2. ✨ Reaproveita o assistente de auditoria universal de forma limpa e atômica
        await createSnapshot('productVersion', 'productId', updatedProduct.id, updatedProduct);

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
