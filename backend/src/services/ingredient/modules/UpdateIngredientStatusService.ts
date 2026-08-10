import prismaClient from '../../../config/prisma.js';
import { Prisma, ProductStatus } from '@prisma/client';
import type { IngredientResponse, IngredientStatus } from '../../../contracts/ingredient/IngredientContract.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { presentIngredient } from '../../../presenters/ingredient/IngredientPresenter.js';
import { toIngredientSnapshotJson } from '../utils/IngredientJson.js';

export class UpdateIngredientStatusService {
  async execute(id: string, status: IngredientStatus): Promise<IngredientResponse> {
    CustomLogger.info(`[Ingredients] Updating status for ${id} to ${status}`);

    try {
      return await prismaClient.$transaction(async (tx) => {
        const updated = await tx.ingredient.update({
          where: { id },
          data: { status: status === 'ACTIVE' ? ProductStatus.ACTIVE : ProductStatus.INACTIVE }
        });

        const presented = presentIngredient(updated);
        await tx.ingredientVersion.create({
          data: {
            ingredientId: updated.id,
            snapshotData: toIngredientSnapshotJson(presented),
            versionDate: updated.updatedAt
          }
        });

        return presented;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new Error('IngredientNotFoundException');
      }

      CustomLogger.error(`[Ingredients] Failed to update status for ${id}`, error);
      throw error;
    }
  }
}
