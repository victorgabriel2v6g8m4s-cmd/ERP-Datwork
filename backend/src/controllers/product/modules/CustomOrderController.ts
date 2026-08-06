import { type Request, type Response } from 'express';
// 🌟 Acoplamento direto com a instância de serviços unificada do módulo de produtos
import { productService } from '../../../services/product/ProductServiceHandler.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class CustomOrderController {
  // 💾 Salva um novo perfil de ordenação customizada
  async create(req: Request, res: Response): Promise<Response> {
    CustomLogger.info('Recebendo requisição HTTP para criar perfil de ordenação customizada');
    const { name, positions } = req.body;

    if (!name || !positions || !Array.isArray(positions)) {
      CustomLogger.warn('Criação rejeitada: nome ou posições estruturadas ausentes');
      return res.status(400).json({ error: 'O nome do perfil e um array estruturado de posições são obrigatórios.' });
    }

    try {
      // ✨ Otimização: Consome direto da árvore de serviços global, sem 'new'
      const profile = await productService.customOrder.save(name, positions);
      return res.status(201).json(profile);
    } catch (error) {
      CustomLogger.error('Erro crítico ao criar perfil de ordenação', error);
      return res.status(500).json({ error: 'Erro interno ao processar a criação do perfil.' });
    }
  }

  async index(req: Request, res: Response): Promise<Response> {
    CustomLogger.info('Recebendo requisição HTTP para listar perfis de ordenação');

    try {
      const profiles = await productService.customOrder.list();
      return res.status(200).json(profiles);
    } catch (error) {
      CustomLogger.error('Erro crítico ao carregar a lista de perfis', error);
      return res.status(500).json({ error: 'Erro interno ao carregar listagem de perfis.' });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { name } = req.body;

    CustomLogger.info(`Recebendo requisição HTTP para renomear perfil ID: ${id}`);

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'O parâmetro ID do perfil é obrigatório e deve ser um texto válido.' });
    }

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'O novo nome do perfil é obrigatório.' });
    }

    try {
      const profile = await productService.customOrder.rename(id, name.trim());
      return res.status(200).json(profile);
    } catch (error: any) {
      if (error.message === 'OrderProfileNotFoundException') {
        CustomLogger.warn(`Renomeação abortada: Perfil ID ${id} não existe`);
        return res.status(404).json({ error: 'O perfil solicitado não foi encontrado no sistema.' });
      }
      CustomLogger.error(`Erro crítico ao renomear perfil ${id}`, error);
      return res.status(500).json({ error: 'Erro interno ao atualizar dados do perfil.' });
    }
  }

  async destroy(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    CustomLogger.info(`Recebendo requisição HTTP para exclusão física do perfil ID: ${id}`);

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'O parâmetro ID do perfil é obrigatório.' });
    }

    try {
      await productService.customOrder.delete(id);
      return res.status(204).send();
    } catch (error: any) {
      if (error.message === 'OrderProfileNotFoundException') {
        CustomLogger.warn(`Exclusão física abortada: Perfil ID ${id} já removido ou inexistente`);
        return res.status(404).json({ error: 'O perfil solicitado não existe ou já foi deletado.' });
      }
      CustomLogger.error(`Erro crítico ao excluir perfil ${id}`, error);
      return res.status(500).json({ error: 'Erro interno ao tentar remover o perfil.' });
    }
  }
}
