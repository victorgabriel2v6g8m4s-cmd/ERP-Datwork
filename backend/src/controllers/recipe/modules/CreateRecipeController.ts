import type { Request, Response } from 'express';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { recipeService } from '../../../services/recipe/RecipeServiceHandler.js';
import { parseRecipeCreate, RecipeRequestValidationError } from '../utils/RecipeRequestValidator.js';

export class CreateRecipeController {
  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const payload = parseRecipeCreate(req.body as unknown);
      const recipe = await recipeService.create.execute(payload);
      return res.status(201).json(recipe);
    } catch (error) {
      if (error instanceof RecipeRequestValidationError) {
        CustomLogger.warn(`[Recipes] Create rejected for field ${error.field}: ${error.message}`);
        return res.status(400).json({ error: error.message });
      }

      if (error instanceof Error && error.message === 'ProductNotFoundException') {
        return res.status(404).json({ error: 'O produto informado não foi encontrado.' });
      }
      if (error instanceof Error && error.message === 'RecipeAlreadyExistsForProductException') {
        return res.status(409).json({ error: 'Este produto já possui uma ficha técnica.' });
      }
      if (error instanceof Error && (
        error.message === 'RecipeIngredientNotFoundException' ||
        error.message === 'InvalidRecipeIngredientCostBasisException'
      )) {
        return res.status(400).json({ error: 'Um ou mais insumos da receita são inválidos.' });
      }

      CustomLogger.error('[Recipes] Failed to create recipe', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
