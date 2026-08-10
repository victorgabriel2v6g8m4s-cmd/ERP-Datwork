import prismaClient from '../../../config/prisma.js';
import type { IngredientVersionResponse } from '../../../contracts/ingredient/IngredientContract.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { presentIngredientVersion } from '../../../presenters/ingredient/IngredientPresenter.js';

export class ListIngredientVersionsService {
  async execute(ingredientId: string): Promise<IngredientVersionResponse[]> {
    const exists = await prismaClient.ingredient.findUnique({
      where: { id: ingredientId },
      select: { id: true }
    });

    if (!exists) throw new Error('IngredientNotFoundException');

    CustomLogger.info(`[Ingredients] Loading history for ${ingredientId}`);
    const versions = await prismaClient.ingredientVersion.findMany({
      where: { ingredientId },
      orderBy: { versionDate: 'desc' },
      select: { id: true, versionDate: true, snapshotData: true }
    });

    return versions.map(presentIngredientVersion);
  }
}
