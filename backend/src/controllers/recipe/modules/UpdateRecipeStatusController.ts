import type { Request, Response } from 'express';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { recipeService } from '../../../services/recipe/RecipeServiceHandler.js';
import {
  parseRecipeId,
  parseRecipeStatus,
  RecipeRequestValidationError
} from '../utils/RecipeRequestValidator.js';

export class UpdateRecipeStatusController {
  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseRecipeId(req.params.id);
      const status = parseRecipeStatus(req.body as unknown);
      const recipe = await recipeService.updateStatus.execute(id, status);
      return res.status(200).json(recipe);
    } catch (error) {
      if (error instanceof RecipeRequestValidationError) {
        return res.status(400).json({ error: error.message });
      }
      if (error instanceof Error && error.message === 'RecipeNotFoundException') {
        return res.status(404).json({ error: 'A ficha técnica solicitada não foi encontrada.' });
      }

      CustomLogger.error('[Recipes] Failed to update recipe status', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
