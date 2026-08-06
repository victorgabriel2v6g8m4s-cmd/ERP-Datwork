import { type Request, type Response } from 'express';
// 🌟 Acoplamento direto com a instância centralizadora de serviços do módulo de produtos e enums
import { productService } from '../../../services/product/ProductServiceHandler.js';
import { AbcCategory, CostInclusion } from '@prisma/client';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class UpdateProductController {
  async handle(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    CustomLogger.info(`Recebendo requisição HTTP para atualização completa do produto ID: ${id}`);

    // Captura as chaves financeiras e de mídias atualizadas do corpo
    const { sku, name, brand, variation, description, thumbnail, medias, indirectCost, abcCategory, includeFixedCosts, finalPrice } = req.body;

    if (!id || typeof id !== 'string') {
      CustomLogger.warn('Requisição de atualização rejeitada: parâmetro ID ausente ou inválido');
      return res.status(400).json({ error: 'O identificador único ID do produto é obrigatório.' });
    }

    try {
      // 🛠️ Monta o payload dinamicamente para respeitar a regra rígida exactOptionalPropertyTypes: true
      const payload: any = { id };

      if (sku !== undefined) payload.sku = sku;
      if (name !== undefined) payload.name = name;
      if (brand !== undefined) payload.brand = brand;
      if (variation !== undefined) payload.variation = variation;
      if (description !== undefined) payload.description = description;
      if (thumbnail !== undefined) payload.thumbnail = thumbnail;
      if (medias !== undefined) payload.medias = medias;

      // Validações e conversões de Enums estritos do Prisma
      if (abcCategory !== undefined) payload.abcCategory = abcCategory as AbcCategory;
      if (includeFixedCosts !== undefined) payload.includeFixedCosts = includeFixedCosts as CostInclusion;

      // Validações e conversões de numéricos
      if (indirectCost !== undefined) payload.indirectCost = Number(indirectCost);
      if (finalPrice !== undefined) payload.finalPrice = Number(finalPrice);

      // ✨ Otimização: Consome diretamente do Handler centralizado, sem overhead de "new UpdateProductService()"
      const updated = await productService.update.execute(payload);

      return res.status(200).json(updated);
    } catch (error: any) {
      if (error.message === 'ProductNotFoundException') {
        CustomLogger.warn(`Atualização de produto abortada na camada HTTP: ID ${id} não existe`);
        return res.status(404).json({ error: 'Produto inexistente no banco de dados.' });
      }

      if (error.message === 'ProductSkuAlreadyExistsException') {
        CustomLogger.warn(`Atualização de produto abortada na camada HTTP: SKU ${sku} já pertence a outro produto`);
        return res.status(409).json({ error: 'O código SKU digitado já pertence a outro produto cadastrado.' });
      }

      CustomLogger.error(`🔥 Erro no PUT do produto ID ${id}:`, error);
      return res.status(500).json({ error: 'Erro interno ao atualizar dados do produto.' });
    }
  }
}
