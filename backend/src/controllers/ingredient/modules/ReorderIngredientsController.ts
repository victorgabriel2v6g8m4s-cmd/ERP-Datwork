import type { Request, Response } from 'express';
import { ingredientService } from '../../../services/ingredient/IngredientServiceHandler.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { parseOrderPositions } from '../utils/IngredientRequestValidator.js';

export class ReorderIngredientsController {
  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const positions = parseOrderPositions(req.body);
      const ingredients = await ingredientService.reorder.execute(positions);
      return res.status(200).json(ingredients);
    } catch (error) {
      if (error instanceof Error && (error.message === 'InvalidOrderPositions' || error.message === 'IngredientReorderMismatch')) {
        return res.status(400).json({ error: 'A ordenação enviada é inválida ou incompleta.' });
      }

      CustomLogger.error('[Ingredients] Failed to reorder ingredients', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
