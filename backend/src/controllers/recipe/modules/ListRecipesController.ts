import { type Request, type Response } from 'express';
import { recipeService } from '../../../services/recipe/RecipeServiceHandler.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class ListRecipesController {
    async handle(_req: Request, res: Response): Promise<Response> {
        CustomLogger.info('Recebendo requisição HTTP para carregar listagem geral de fichas técnicas');

        try {
            const recipes = await recipeService.list.execute();
            return res.status(200).json(recipes);
        } catch (error) {
            CustomLogger.error('Erro crítico ao carregar listagem de receitas', error);
            return res.status(500).json({ error: 'Internal Server Error ao processar listagem de receitas.' });
        }
    }
}
