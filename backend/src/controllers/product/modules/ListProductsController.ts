import { type Request, type Response } from 'express';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { productService } from '../../../services/product/ProductServiceHandler.js';

export class ListProductsController {
  async handle(_req: Request, res: Response): Promise<Response> {
    CustomLogger.info('Recebendo requisição HTTP para carregar catálogo de produtos ativos');

    try {
      const products = await productService.list.execute();
      return res.status(200).json(products);
    } catch (error) {
      CustomLogger.error('Erro crítico ao processar catálogo de produtos na camada HTTP', error);
      return res.status(500).json({ error: 'Erro interno ao processar lista de produtos.' });
    }
  }
}
