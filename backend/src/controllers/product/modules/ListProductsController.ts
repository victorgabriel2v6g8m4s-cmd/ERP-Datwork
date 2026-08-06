import { type Request, type Response } from 'express';
// 🌟 Acoplamento direto com o banco de dados e o motor de cálculo através de boas práticas
import prismaClient from '../../../config/prisma.js';
import { PricingEngine } from '../../../math/PricingEngine.js';
import { ProductStatus } from '@prisma/client';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class ListProductsController {
  async handle(req: Request, res: Response): Promise<Response> {
    CustomLogger.info('Recebendo requisição HTTP para carregar catálogo de produtos ativos');

    try {
      // 🛡️ Garante que a esteira matemática esteja sincronizada antes de entregar o payload
      await PricingEngine.recalculateAll();

      // ✨ Otimização de performance: Mantemos a listagem principal em massa trazendo as receitas pré-carregadas
      const products = await prismaClient.product.findMany({
        where: {
          status: ProductStatus.ACTIVE // ✨ Uso do Enum estrito do Schema
        },
        orderBy: {
          position: 'asc'
        },
        include: {
          recipe: {
            select: {
              id: true,
              unitsPerBatch: true
            }
          }
        }
      });

      // Mapeia o payload injetando as chaves síncronas para o frontend ler sem quebras
      const mappedProducts = products.map(prod => ({
        ...prod,
        unitsPerBatch: prod.recipe?.unitsPerBatch || 1
      }));

      return res.status(200).json(mappedProducts);
    } catch (error) {
      CustomLogger.error('Erro crítico ao processar catálogo de produtos na camada HTTP', error);
      return res.status(500).json({ error: 'Erro interno ao processar lista de produtos.' });
    }
  }
}
