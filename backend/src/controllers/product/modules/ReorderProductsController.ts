import type { Request, Response } from 'express';
import { productService } from '../../../services/product/ProductServiceHandler.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import {
  parseProductPositions,
  ProductRequestValidationError
} from '../utils/ProductRequestValidator.js';

export class ReorderProductsController {
  async handle(req: Request, res: Response): Promise<Response> {
    CustomLogger.info('Recebendo requisição HTTP para reordenação de produtos em lote');

    try {
      const positions = parseProductPositions(req.body as unknown);
      await productService.reorder.execute(positions);
      return res.status(204).send();
    } catch (error) {
      if (error instanceof ProductRequestValidationError || (
        error instanceof Error && error.message === 'ProductReorderMismatch'
      )) {
        CustomLogger.warn('[Products] Reorder rejected because the payload is invalid or stale');
        return res.status(400).json({ error: 'A ordenação enviada é inválida ou incompleta.' });
      }

      CustomLogger.error('Erro crítico não tratado ao reordenar lote de produtos na camada HTTP', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
