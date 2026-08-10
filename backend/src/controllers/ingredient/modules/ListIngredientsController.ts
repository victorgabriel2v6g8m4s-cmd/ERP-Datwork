import type { Request, Response } from 'express';
import { ingredientService } from '../../../services/ingredient/IngredientServiceHandler.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class ListIngredientsController {
  async handle(_req: Request, res: Response): Promise<Response> {
    try {
      const ingredients = await ingredientService.list.execute();
      return res.status(200).json(ingredients);
    } catch (error) {
      CustomLogger.error('[Ingredients] Failed to list ingredients', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
