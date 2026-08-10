import type { Request, Response } from 'express';
import { ingredientService } from '../../../services/ingredient/IngredientServiceHandler.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { parseIngredientId, parseOrderPositions, parseOrderProfileName } from '../utils/IngredientRequestValidator.js';

export class IngredientOrderProfileController {
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const name = parseOrderProfileName(req.body);
      const positions = parseOrderPositions(req.body);
      const profile = await ingredientService.orderProfiles.save(name, positions);
      return res.status(201).json(profile);
    } catch (error) {
      if (error instanceof Error && (error.message === 'InvalidOrderProfilePayload' || error.message === 'InvalidOrderPositions')) {
        return res.status(400).json({ error: 'Perfil de ordenação inválido.' });
      }

      CustomLogger.error('[Ingredients] Failed to create order profile', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async list(_req: Request, res: Response): Promise<Response> {
    try {
      const profiles = await ingredientService.orderProfiles.list();
      return res.status(200).json(profiles);
    } catch (error) {
      CustomLogger.error('[Ingredients] Failed to list order profiles', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async rename(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseIngredientId(req.params.id);
      const name = parseOrderProfileName(req.body);
      const profile = await ingredientService.orderProfiles.rename(id, name);
      return res.status(200).json(profile);
    } catch (error) {
      if (error instanceof Error && error.message === 'OrderProfileNotFoundException') {
        return res.status(404).json({ error: 'Perfil de ordenação não encontrado.' });
      }
      if (error instanceof Error && error.message === 'InvalidOrderProfilePayload') {
        return res.status(400).json({ error: 'Nome do perfil inválido.' });
      }

      CustomLogger.error('[Ingredients] Failed to rename order profile', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async remove(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseIngredientId(req.params.id);
      await ingredientService.orderProfiles.delete(id);
      return res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'OrderProfileNotFoundException') {
        return res.status(404).json({ error: 'Perfil de ordenação não encontrado.' });
      }

      CustomLogger.error('[Ingredients] Failed to delete order profile', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
