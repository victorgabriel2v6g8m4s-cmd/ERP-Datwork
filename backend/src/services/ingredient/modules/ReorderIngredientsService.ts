import prismaClient from '../../../config/prisma.js';
import type { IngredientResponse } from '../../../contracts/ingredient/IngredientContract.js';
import type { ScopedOrderPosition } from '../../orderProfile/ScopedOrderProfileService.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { presentIngredient } from '../../../presenters/ingredient/IngredientPresenter.js';

export class ReorderIngredientsService {
  async execute(positions: ScopedOrderPosition[]): Promise<IngredientResponse[]> {
    const current = await prismaClient.ingredient.findMany({ select: { id: true } });
    const currentIds = new Set(current.map((item) => item.id));
    const incomingIds = new Set(positions.map((item) => item.id));

    if (
      positions.length !== current.length ||
      incomingIds.size !== currentIds.size ||
      [...currentIds].some((id) => !incomingIds.has(id))
    ) {
      throw new Error('IngredientReorderMismatch');
    }

    CustomLogger.info(`[Ingredients] Persisting order for ${positions.length} ingredients`);

    return prismaClient.$transaction(async (tx) => {
      for (const item of positions) {
        await tx.ingredient.update({
          where: { id: item.id },
          data: { position: item.position }
        });
      }

      const reordered = await tx.ingredient.findMany({ orderBy: { position: 'asc' } });
      return reordered.map(presentIngredient);
    });
  }
}
