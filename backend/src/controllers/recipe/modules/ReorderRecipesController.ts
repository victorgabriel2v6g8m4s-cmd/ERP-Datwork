import { type Request, type Response } from 'express';
// 🌟 Acoplamento direto com a instância centralizadora de serviços do módulo de receitas
import { recipeService } from '../../../services/recipe/RecipeServiceHandler.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class ReorderRecipesController {
    async handle(req: Request, res: Response): Promise<Response> {
        CustomLogger.info('Recebendo requisição HTTP para reordenação de receitas em lote');

        const { positions } = req.body;

        // Validação defensiva na camada de entrada HTTP
        if (!positions || !Array.isArray(positions)) {
            CustomLogger.warn('Tentativa de reordenação de receitas rejeitada: payload inválido ou ausente');
            return res.status(400).json({ error: 'O campo positions é obrigatório e deve ser um array estruturado.' });
        }

        try {
            // Sanitiza o payload garantindo que a posição seja um número estrito antes de enviar ao service
            const sanitizedPositions = positions.map(item => ({
                id: String(item.id),
                position: Number(item.position)
            }));

            // ✨ Otimização: Consome diretamente a instância unificada do Service (que possui o filtro antidesperdício)
            await recipeService.reorder.execute(sanitizedPositions);

            return res.status(204).send(); // Retorna 204 No Content para operações de lote bem-sucedidas sem corpo
        } catch (error) {
            CustomLogger.error('Erro crítico não tratado ao reordenar lote de receitas na camada HTTP', error);
            return res.status(500).json({ error: 'Erro interno ao reordenar fichas técnicas.' });
        }
    }
}
