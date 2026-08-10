import type { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ingredientService } from '../../../services/ingredient/IngredientServiceHandler.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { parseIngredientMutation } from '../utils/IngredientRequestValidator.js';

export class CreateIngredientController {
  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const payload = parseIngredientMutation(req.body);
      const ingredient = await ingredientService.create.execute(payload);
      return res.status(201).json(ingredient);
    } catch (error) {
      if (error instanceof Error && error.message === 'InvalidIngredientPayload') {
        return res.status(400).json({ error: 'Dados do insumo inválidos.' });
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return res.status(409).json({ error: 'Já existe um insumo com este SKU.' });
      }

      CustomLogger.error('[Ingredients] Failed to create ingredient', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
