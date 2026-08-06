import { type Request, type Response } from 'express';
// 🌟 Acoplamento direto com a instância centralizadora de serviços do módulo de receitas
import { recipeService } from '../../../services/recipe/RecipeServiceHandler.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class CreateRecipeController {
    async handle(req: Request, res: Response): Promise<Response> {
        CustomLogger.info('Recebendo requisição HTTP para criação de nova ficha técnica (Recipe)');

        const { productId, unitsPerBatch, ingredients } = req.body;

        // Validação defensiva na camada de entrada HTTP para evitar processamentos inúteis
        if (!productId || unitsPerBatch === undefined || isNaN(Number(unitsPerBatch))) {
            CustomLogger.warn('Tentativa de criação de receita rejeitada: parâmetros obrigatórios ausentes ou inválidos');
            return res.status(400).json({ error: 'Os campos ID do Produto e uma quantidade numérica por Lote são obrigatórios.' });
        }

        try {
            // 🛠️ Monta o payload respeitando rigorosamente a regra exactOptionalPropertyTypes: true
            const payload = {
                productId,
                unitsPerBatch: Number(unitsPerBatch),
                // Garante que ingredients sempre será tratado de forma segura pela esteira do Service
                ingredients: Array.isArray(ingredients) ? ingredients : []
            };

            // ✨ Otimização: Consome diretamente do Handler centralizado, sem o "new" manual
            const recipe = await recipeService.create.execute(payload);

            return res.status(201).json(recipe);
        } catch (error: any) {
            if (error.message === 'RecipeAlreadyExistsForProductException') {
                CustomLogger.warn(`Criação de receita abortada na camada HTTP: Produto ${productId} já possui ficha técnica`);
                return res.status(409).json({
                    error: 'Este produto já possui uma Ficha Técnica cadastrada. Use o gesto de deslizar para a direita para editá-la!'
                });
            }

            if (error.message === 'ProductNotFoundException') {
                CustomLogger.warn(`Criação de receita abortada na camada HTTP: Produto ID ${productId} não existe`);
                return res.status(404).json({ error: 'O produto alvo não foi localizado no sistema.' });
            }

            CustomLogger.error('Erro crítico não tratado ao registrar nova ficha técnica', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
