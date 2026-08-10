import type { Request, Response } from 'express';
import { ingredientService } from '../../../services/ingredient/IngredientServiceHandler.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { parseIngredientId } from '../utils/IngredientRequestValidator.js';

export class ListIngredientVersionsController {
  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const ingredientId = parseIngredientId(req.params.ingredientId);
      const versions = await ingredientService.listVersions.execute(ingredientId);
      return res.status(200).json(versions);
    } catch (error) {
      if (error instanceof Error && error.message === 'IngredientNotFoundException') {
        return res.status(404).json({ error: 'Insumo não encontrado.' });
      }

      CustomLogger.error('[Ingredients] Failed to load ingredient history', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
