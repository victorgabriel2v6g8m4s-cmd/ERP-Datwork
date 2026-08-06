import { type Request, type Response } from 'express';
// Acoplamento direto com a instância centralizadora de serviços do módulo de produtos
import { productService } from '../../../services/product/ProductServiceHandler.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class CreateProductController {
    async handle(req: Request, res: Response): Promise<Response> {
        CustomLogger.info('Recebendo requisição HTTP para criação de novo produto unificado');

        const { sku, name, brand, variation, thumbnail, description, indirectCost } = req.body;

        if (!sku || !name) {
            CustomLogger.warn('Tentativa de criação de produto rejeitada: campos SKU ou Nome ausentes');
            return res.status(400).json({ error: 'Os campos SKU e Nome são obrigatórios para o cadastro.' });
        }

        try {
            // 🛠️ Monta o payload dinamicamente para respeitar exactOptionalPropertyTypes
            const payload: any = {
                sku,
                name
            };

            if (brand !== undefined) payload.brand = brand;
            if (variation !== undefined) payload.variation = variation;
            if (thumbnail !== undefined) payload.thumbnail = thumbnail;
            if (description !== undefined) payload.description = description;

            // Converte e injeta apenas se de fato existir no req.body
            if (indirectCost !== undefined) {
                payload.indirectCost = Number(indirectCost);
            }

            // ✨ Otimização: Consome direto do Handler centralizado mapeando o objeto limpo
            const product = await productService.create.execute(payload);

            return res.status(201).json(product);
        } catch (error: any) {
            if (error.message === 'ProductAlreadyExistsException') {
                CustomLogger.warn(`Cadastro rejeitado na camada HTTP: SKU ${sku} já cadastrado`);
                return res.status(400).json({ error: 'Já existe um produto registrado no ERP com este SKU.' });
            }

            CustomLogger.error('Erro crítico não tratado ao registrar novo produto', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
