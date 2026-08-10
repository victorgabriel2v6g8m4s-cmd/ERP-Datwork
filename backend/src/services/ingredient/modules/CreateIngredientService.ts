import prismaClient from '../../../config/prisma.js';
import { Prisma, ProductStatus } from '@prisma/client';
import type { IngredientMutationInput, IngredientResponse } from '../../../contracts/ingredient/IngredientContract.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { presentIngredient } from '../../../presenters/ingredient/IngredientPresenter.js';
import { toIngredientMediaJson, toIngredientSnapshotJson } from '../utils/IngredientJson.js';

export class CreateIngredientService {
  async execute(data: IngredientMutationInput): Promise<IngredientResponse> {
    CustomLogger.info(`[Ingredients] Creating ingredient ${data.sku}`);

    try {
      return await prismaClient.$transaction(async (tx) => {
        const lastIngredient = await tx.ingredient.findFirst({
          orderBy: { position: 'desc' },
          select: { position: true }
        });

        const created = await tx.ingredient.create({
          data: {
            sku: data.sku,
            name: data.name,
            price: data.price,
            quantity: data.quantity,
            unit: data.unit,
            thumbnail: data.thumbnail,
            medias: data.medias.length > 0 ? toIngredientMediaJson(data.medias) : Prisma.DbNull,
            position: lastIngredient ? lastIngredient.position + 1 : 0,
            status: ProductStatus.ACTIVE
          }
        });

        const presented = presentIngredient(created);
        await tx.ingredientVersion.create({
          data: {
            ingredientId: created.id,
            snapshotData: toIngredientSnapshotJson(presented),
            versionDate: created.updatedAt
          }
        });

        return presented;
      });
    } catch (error) {
      CustomLogger.error(`[Ingredients] Failed to create ingredient ${data.sku}`, error);
      throw error;
    }
  }
}
