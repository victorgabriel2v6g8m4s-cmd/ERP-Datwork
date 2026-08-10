import type { Request, Response } from 'express';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { recipeService } from '../../../services/recipe/RecipeServiceHandler.js';

export class ListRecipesController {
  async handle(_req: Request, res: Response): Promise<Response> {
    try {
      const recipes = await recipeService.list.execute();
      return res.status(200).json(recipes);
    } catch (error) {
      CustomLogger.error('[Recipes] Failed to list recipes', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
