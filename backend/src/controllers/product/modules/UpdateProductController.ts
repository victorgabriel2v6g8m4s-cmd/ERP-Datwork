import { type Request, type Response } from 'express';
import { productService } from '../../../services/product/ProductServiceHandler.js';
import { type UpdateProductRequest } from '../../../contracts/product/ProductContract.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import {
  ProductRequestValidationError,
  parseOptionalAbcCategory,
  parseOptionalCostInclusion,
  parseOptionalNonEmptyString,
  parseOptionalNonNegativeNumber,
  parseOptionalNullableString,
  parseOptionalProductMedias
} from '../utils/ProductRequestValidator.js';

export class UpdateProductController {
  async handle(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      CustomLogger.warn('Requisição de atualização rejeitada: parâmetro ID ausente ou inválido');
      return res.status(400).json({ error: 'O identificador único ID do produto é obrigatório.' });
    }

    CustomLogger.info(`Recebendo requisição HTTP para atualização do produto ID: ${id}`);

    const body = req.body as Record<string, unknown>;
    let skuForLog: string | null = null;

    try {
      const payload: UpdateProductRequest = { id };

      const sku = parseOptionalNonEmptyString(body.sku, 'sku');
      const name = parseOptionalNonEmptyString(body.name, 'name');
      const brand = parseOptionalNullableString(body.brand, 'brand');
      const variation = parseOptionalNullableString(body.variation, 'variation');
      const description = parseOptionalNullableString(body.description, 'description');
      const thumbnail = parseOptionalNullableString(body.thumbnail, 'thumbnail');
      const medias = parseOptionalProductMedias(body.medias);
      const indirectCost = parseOptionalNonNegativeNumber(body.indirectCost, 'indirectCost');
      const finalPrice = parseOptionalNonNegativeNumber(body.finalPrice, 'finalPrice');
      const abcCategory = parseOptionalAbcCategory(body.abcCategory);
      const includeFixedCosts = parseOptionalCostInclusion(body.includeFixedCosts);

      if (sku !== undefined) {
        payload.sku = sku.toUpperCase();
        skuForLog = payload.sku;
      }
      if (name !== undefined) payload.name = name;
      if (brand !== undefined) payload.brand = brand;
      if (variation !== undefined) payload.variation = variation;
      if (description !== undefined) payload.description = description;
      if (thumbnail !== undefined) payload.thumbnail = thumbnail;
      if (medias !== undefined) payload.medias = medias;
      if (indirectCost !== undefined) payload.indirectCost = indirectCost;
      if (finalPrice !== undefined) payload.finalPrice = finalPrice;
      if (abcCategory !== undefined) payload.abcCategory = abcCategory;
      if (includeFixedCosts !== undefined) payload.includeFixedCosts = includeFixedCosts;

      const updated = await productService.update.execute(payload);
      return res.status(200).json(updated);
    } catch (error: unknown) {
      if (error instanceof ProductRequestValidationError) {
        CustomLogger.warn(`Atualização do produto ${id} rejeitada por payload inválido`, {
          field: error.field,
          reason: error.message
        });
        return res.status(400).json({ error: error.message });
      }

      if (error instanceof Error && error.message === 'ProductNotFoundException') {
        CustomLogger.warn(`Atualização abortada: produto ID ${id} não existe`);
        return res.status(404).json({ error: 'Produto inexistente no banco de dados.' });
      }

      if (error instanceof Error && error.message === 'ProductSkuAlreadyExistsException') {
        CustomLogger.warn(`Atualização abortada: SKU ${skuForLog ?? 'unknown'} já pertence a outro produto`);
        return res.status(409).json({ error: 'O código SKU digitado já pertence a outro produto cadastrado.' });
      }

      CustomLogger.error(`Erro no PUT do produto ID ${id}`, error);
      return res.status(500).json({ error: 'Erro interno ao atualizar dados do produto.' });
    }
  }
}
