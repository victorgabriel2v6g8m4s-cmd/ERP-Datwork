import prismaClient from '../../../config/prisma.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class ListProductVersionsService {
  async execute(productId: string) {
    if (!productId) {
      CustomLogger.warn('Tentativa de listar versões com ProductId ausente');
      throw new Error('ProductIdRequiredException');
    }

    CustomLogger.info(`Buscando histórico de versões para o produto ID: ${productId}`);

    try {
      // ✨ Busca todas as versões salvas aproveitando o índice de busca criado no Schema
      return await prismaClient.productVersion.findMany({
        where: { productId },
        orderBy: { versionDate: 'desc' },
        select: {
          id: true,
          versionDate: true,
          snapshotData: true // ✨ O Prisma já entrega como objeto JSON vivo, não mais como string de texto!
        }
      });
    } catch (error) {
      CustomLogger.error(`Erro ao buscar histórico de versões do produto ${productId}`, error);
      throw new Error('DatabaseFetchException');
    }
  }
}
