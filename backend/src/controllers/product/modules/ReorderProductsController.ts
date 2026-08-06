import { type Request, type Response } from 'express';
// 🌟 Acoplamento direto com a instância centralizadora de serviços do módulo de produtos
import { productService } from '../../../services/product/ProductServiceHandler.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class ReorderProductsController {
  async handle(req: Request, res: Response): Promise<Response> {
    CustomLogger.info('Recebendo requisição HTTP para reordenação de produtos em lote');

    const { positions } = req.body;

    // Validação defensiva na camada de entrada HTTP
    if (!positions || !Array.isArray(positions)) {
      CustomLogger.warn('Tentativa de reordenação em lote rejeitada: payload inválido ou ausente');
      return res.status(400).json({ error: 'O campo positions é obrigatório e deve ser um array estruturado.' });
    }

    try {
      // ✨ Otimização: Consome diretamente a instância unificada, sem o "new" manual
      await productService.reorder.execute(positions);

      return res.status(204).send(); // Retorna No Content em caso de sucesso absoluto
    } catch (error) {
      CustomLogger.error('Erro crítico não tratado ao reordenar lote de produtos na camada HTTP', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
