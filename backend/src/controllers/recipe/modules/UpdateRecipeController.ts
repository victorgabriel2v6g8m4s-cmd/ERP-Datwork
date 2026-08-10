import type { Request, Response } from 'express';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { recipeService } from '../../../services/recipe/RecipeServiceHandler.js';
import { parseRecipeUpdate, RecipeRequestValidationError } from '../utils/RecipeRequestValidator.js';

export class UpdateRecipeController {
  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const payload = parseRecipeUpdate(req.params.id, req.body as unknown);
      const recipe = await recipeService.update.execute(payload);
      return res.status(200).json(recipe);
    } catch (error) {
      if (error instanceof RecipeRequestValidationError) {
        CustomLogger.warn(`[Recipes] Update rejected for field ${error.field}: ${error.message}`);
        return res.status(400).json({ error: error.message });
      }
      if (error instanceof Error && error.message === 'RecipeNotFoundException') {
        return res.status(404).json({ error: 'A ficha técnica solicitada não foi encontrada.' });
      }
      if (error instanceof Error && (
        error.message === 'RecipeIngredientNotFoundException' ||
        error.message === 'InvalidRecipeIngredientCostBasisException'
      )) {
        return res.status(400).json({ error: 'Um ou mais insumos da receita são inválidos.' });
      }

      CustomLogger.error('[Recipes] Failed to update recipe', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
