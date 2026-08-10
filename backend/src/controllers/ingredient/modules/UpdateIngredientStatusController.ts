import type { Request, Response } from 'express';
import { ingredientService } from '../../../services/ingredient/IngredientServiceHandler.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { parseIngredientId, parseIngredientStatus } from '../utils/IngredientRequestValidator.js';

export class UpdateIngredientStatusController {
  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseIngredientId(req.params.id);
      const status = parseIngredientStatus(req.body);
      const ingredient = await ingredientService.updateStatus.execute(id, status);
      return res.status(200).json(ingredient);
    } catch (error) {
      if (error instanceof Error && (error.message === 'InvalidIngredientPayload' || error.message === 'InvalidIngredientStatus')) {
        return res.status(400).json({ error: 'Status do insumo inválido.' });
      }

      if (error instanceof Error && error.message === 'IngredientNotFoundException') {
        return res.status(404).json({ error: 'Insumo não encontrado.' });
      }

      CustomLogger.error('[Ingredients] Failed to update ingredient status', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
