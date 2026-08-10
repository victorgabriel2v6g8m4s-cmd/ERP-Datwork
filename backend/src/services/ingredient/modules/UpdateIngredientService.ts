import prismaClient from '../../../config/prisma.js';
import { Prisma } from '@prisma/client';
import type { IngredientMutationInput, IngredientResponse } from '../../../contracts/ingredient/IngredientContract.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { PricingEngine } from '../../../math/PricingEngine.js';
import { presentIngredient } from '../../../presenters/ingredient/IngredientPresenter.js';
import { toIngredientMediaJson, toIngredientSnapshotJson } from '../utils/IngredientJson.js';

export class UpdateIngredientService {
  async execute(id: string, data: IngredientMutationInput): Promise<IngredientResponse> {
    CustomLogger.info(`[Ingredients] Updating ingredient ${id}`);

    try {
      const result = await prismaClient.$transaction(async (tx) => {
        const updated = await tx.ingredient.update({
          where: { id },
          data: {
            sku: data.sku,
            name: data.name,
            price: data.price,
            quantity: data.quantity,
            unit: data.unit,
            thumbnail: data.thumbnail,
            medias: data.medias.length > 0 ? toIngredientMediaJson(data.medias) : Prisma.DbNull
          }
        });

        const presented = presentIngredient(updated);
        await tx.ingredientVersion.create({
          data: {
            ingredientId: updated.id,
            snapshotData: toIngredientSnapshotJson(presented),
            versionDate: updated.updatedAt
          }
        });

        const recipeItems = await tx.recipeItem.findMany({
          where: { ingredientId: id },
          select: { recipe: { select: { productId: true } } }
        });

        return {
          ingredient: presented,
          productIds: [...new Set(recipeItems.map((item) => item.recipe.productId))]
        };
      });

      await PricingEngine.recalculateProducts(result.productIds);
      return result.ingredient;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new Error('IngredientNotFoundException');
      }

      CustomLogger.error(`[Ingredients] Failed to update ingredient ${id}`, error);
      throw error;
    }
  }
}
