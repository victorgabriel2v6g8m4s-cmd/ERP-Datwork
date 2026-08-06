import { type Request, type Response } from 'express';
// 🌟 Acoplamento direto com a instância centralizadora de serviços do módulo de produtos
import { productService } from '../../../services/product/ProductServiceHandler.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class ListProductVersionsController {
  async handle(req: Request, res: Response): Promise<Response> {
    const { productId } = req.params;

    CustomLogger.info(`Recebendo requisição HTTP para listar histórico de versões do produto ID: ${productId}`);

    // Validação estrita contra arrays e nulos para o TSConfig corporativo
    if (!productId || typeof productId !== 'string') {
      CustomLogger.warn('Requisição de histórico rejeitada: productId inválido ou ausente');
      return res.status(400).json({ error: 'O identificador único productId é obrigatório e deve ser um texto válido.' });
    }

    try {
      // ✨ Otimização: Consome direto da árvore de serviços global, sem 'new' manual
      const versions = await productService.listVersions.execute(productId);

      return res.status(200).json(versions);
    } catch (error: any) {
      if (error.message === 'ProductIdRequiredException') {
        return res.status(400).json({ error: 'O código identificador do produto precisa ser fornecido.' });
      }

      CustomLogger.error(`Erro crítico não tratado ao buscar histórico de versões do produto ${productId}`, error);
      return res.status(500).json({ error: 'Erro interno do servidor ao processar histórico de auditoria.' });
    }
  }
}
