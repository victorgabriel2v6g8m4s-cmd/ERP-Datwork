import { type Request, type Response } from 'express';
import { productService } from '../../../services/product/ProductServiceHandler.js';
import { type CreateProductRequest } from '../../../services/product/modules/CreateProductService.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import {
    ProductRequestValidationError,
    parseOptionalAbcCategory,
    parseOptionalCostInclusion,
    parseOptionalNonNegativeNumber,
    parseOptionalNullableString,
    parseOptionalProductMedias,
    parseRequiredNonEmptyString
} from '../utils/ProductRequestValidator.js';

export class CreateProductController {
    async handle(req: Request, res: Response): Promise<Response> {
        CustomLogger.info('Recebendo requisição HTTP para criação de produto');

        const body = req.body as Record<string, unknown>;
        let skuForLog = 'unknown';

        try {
            const sku = parseRequiredNonEmptyString(body.sku, 'sku').toUpperCase();
            const name = parseRequiredNonEmptyString(body.name, 'name');
            skuForLog = sku;

            const payload: CreateProductRequest = { sku, name };

            const brand = parseOptionalNullableString(body.brand, 'brand');
            const variation = parseOptionalNullableString(body.variation, 'variation');
            const thumbnail = parseOptionalNullableString(body.thumbnail, 'thumbnail');
            const description = parseOptionalNullableString(body.description, 'description');
            const medias = parseOptionalProductMedias(body.medias);
            const indirectCost = parseOptionalNonNegativeNumber(body.indirectCost, 'indirectCost');
            const finalPrice = parseOptionalNonNegativeNumber(body.finalPrice, 'finalPrice');
            const abcCategory = parseOptionalAbcCategory(body.abcCategory);
            const includeFixedCosts = parseOptionalCostInclusion(body.includeFixedCosts);

            if (brand !== undefined) payload.brand = brand;
            if (variation !== undefined) payload.variation = variation;
            if (thumbnail !== undefined) payload.thumbnail = thumbnail;
            if (description !== undefined) payload.description = description;
            if (medias !== undefined) payload.medias = medias;
            if (indirectCost !== undefined) payload.indirectCost = indirectCost;
            if (finalPrice !== undefined) payload.finalPrice = finalPrice;
            if (abcCategory !== undefined) payload.abcCategory = abcCategory;
            if (includeFixedCosts !== undefined) payload.includeFixedCosts = includeFixedCosts;

            const product = await productService.create.execute(payload);
            return res.status(201).json(product);
        } catch (error: unknown) {
            if (error instanceof ProductRequestValidationError) {
                CustomLogger.warn('Cadastro de produto rejeitado por payload inválido', {
                    field: error.field,
                    reason: error.message
                });
                return res.status(400).json({ error: error.message });
            }

            if (error instanceof Error && error.message === 'ProductAlreadyExistsException') {
                CustomLogger.warn(`Cadastro rejeitado: SKU ${skuForLog} já cadastrado`);
                return res.status(400).json({ error: 'Já existe um produto registrado no ERP com este SKU.' });
            }

            CustomLogger.error('Erro crítico não tratado ao registrar novo produto', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
