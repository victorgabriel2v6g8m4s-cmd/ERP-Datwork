import type { Request, Response } from 'express';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { recipeService } from '../../../services/recipe/RecipeServiceHandler.js';
import { parseRecipePositions, RecipeRequestValidationError } from '../utils/RecipeRequestValidator.js';

export class ReorderRecipesController {
  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const positions = parseRecipePositions(req.body as unknown);
      const recipes = await recipeService.reorder.execute(positions);
      return res.status(200).json(recipes);
    } catch (error) {
      if (error instanceof RecipeRequestValidationError || (
        error instanceof Error && error.message === 'RecipeReorderMismatch'
      )) {
        return res.status(400).json({ error: 'A ordenação enviada é inválida ou incompleta.' });
      }

      CustomLogger.error('[Recipes] Failed to reorder recipes', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
