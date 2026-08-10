import prismaClient from '../../../config/prisma.js';
import type { RecipeResponse, UpdateRecipeInput } from '../../../contracts/recipe/RecipeContract.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { PricingEngine } from '../../../math/PricingEngine.js';
import { presentRecipe, RECIPE_RESPONSE_INCLUDE } from '../../../presenters/recipe/RecipePresenter.js';
import { calculateRecipeCostPerUnit } from '../utils/RecipeCost.js';

export class UpdateRecipeService {
  async execute(data: UpdateRecipeInput): Promise<RecipeResponse> {
    CustomLogger.info(`[Recipes] Updating recipe ${data.id}`);

    try {
      const productId = await prismaClient.$transaction(async (tx) => {
        const recipe = await tx.recipe.findUnique({
          where: { id: data.id },
          select: { productId: true }
        });
        if (!recipe) throw new Error('RecipeNotFoundException');

        const recipeCostPerUnit = await calculateRecipeCostPerUnit(tx, data.ingredients, data.unitsPerBatch);

        await tx.recipe.update({
          where: { id: data.id },
          data: { unitsPerBatch: data.unitsPerBatch }
        });
        await tx.recipeItem.deleteMany({ where: { recipeId: data.id } });
        await tx.recipeItem.createMany({
          data: data.ingredients.map((item) => ({
            recipeId: data.id,
            ingredientId: item.ingredientId,
            quantityNeeded: item.quantityNeeded
          }))
        });
        await tx.product.update({
          where: { id: recipe.productId },
          data: { recipeCostPerUnit }
        });

        return recipe.productId;
      });

      CustomLogger.info('[Recipes] Recipe committed; recalculating dependent product pricing');
      await PricingEngine.recalculateProducts([productId]);

      const recipe = await prismaClient.recipe.findUnique({
        where: { id: data.id },
        include: RECIPE_RESPONSE_INCLUDE
      });
      if (!recipe) throw new Error('RecipeNotFoundException');

      return presentRecipe(recipe);
    } catch (error) {
      if (error instanceof Error && (
        error.message === 'RecipeNotFoundException' ||
        error.message === 'RecipeIngredientNotFoundException'
      )) {
        CustomLogger.warn(`[Recipes] Update rejected for ${data.id}: ${error.message}`);
        throw error;
      }

      CustomLogger.error(`[Recipes] Failed to update recipe ${data.id}`, error);
      throw error;
    }
  }
}
