import { type Request, type Response } from 'express';
// 🌟 Acoplamento direto com a instância centralizadora de serviços do módulo de receitas
import { recipeService } from '../../../services/recipe/RecipeServiceHandler.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class UpdateRecipeController {
    async handle(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        const { unitsPerBatch, ingredients } = req.body;

        CustomLogger.info(`Recebendo requisição HTTP para atualização da ficha técnica ID: ${id}`);

        // Validação estrita na camada HTTP para o Narrowing do TypeScript
        if (!id || typeof id !== 'string') {
            CustomLogger.warn('Requisição de atualização rejeitada: parâmetro ID inválido ou ausente');
            return res.status(400).json({ error: 'O parâmetro ID da receita é obrigatório e deve ser um texto válido.' });
        }

        if (unitsPerBatch === undefined || isNaN(Number(unitsPerBatch)) || !ingredients) {
            CustomLogger.warn(`Tentativa de atualização da receita ${id} com parâmetros estruturais ausentes ou inválidos`);
            return res.status(400).json({ error: 'Os campos de rendimento por lote (unitsPerBatch) e a lista de insumos são obrigatórios.' });
        }

        try {
            // 🛠️ Monta o payload dinamicamente limpando tipos incorretos e respeitando exactOptionalPropertyTypes
            const payload = {
                id,
                unitsPerBatch: Number(unitsPerBatch),
                ingredients: Array.isArray(ingredients) ? ingredients : []
            };

            // ✨ Otimização: Consome diretamente a instância unificada, sem o "new" manual
            const recipe = await recipeService.update.execute(payload);

            return res.status(200).json(recipe);
        } catch (error: any) {
            if (error.message === 'RecipeNotFoundException') {
                CustomLogger.warn(`Atualização abortada na camada HTTP: Ficha técnica ID ${id} não existe`);
                return res.status(404).json({ error: 'A ficha técnica solicitada não foi encontrada no sistema.' });
            }

            CustomLogger.error(`Erro crítico não tratado ao atualizar a receita ID ${id}`, error);
            return res.status(500).json({ error: 'Erro interno do servidor ao editar a receita.' });
        }
    }
}
