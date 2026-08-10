import { Prisma, ProductStatus } from '@prisma/client';
import prismaClient from '../../../config/prisma.js';
import type { CreateRecipeInput, RecipeResponse } from '../../../contracts/recipe/RecipeContract.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { PricingEngine } from '../../../math/PricingEngine.js';
import { presentRecipe, RECIPE_RESPONSE_INCLUDE } from '../../../presenters/recipe/RecipePresenter.js';
import { calculateRecipeCostPerUnit } from '../utils/RecipeCost.js';

export class CreateRecipeService {
  async execute(data: CreateRecipeInput): Promise<RecipeResponse> {
    CustomLogger.info('[Recipes] Creating recipe', { productId: data.productId });

    try {
      const recipeId = await prismaClient.$transaction(async (tx) => {
        const product = await tx.product.findUnique({
          where: { id: data.productId },
          select: { id: true, recipe: { select: { id: true } } }
        });

        if (!product) throw new Error('ProductNotFoundException');
        if (product.recipe) throw new Error('RecipeAlreadyExistsForProductException');

        const recipeCostPerUnit = await calculateRecipeCostPerUnit(tx, data.ingredients, data.unitsPerBatch);
        const lastRecipe = await tx.recipe.findFirst({
          orderBy: { position: 'desc' },
          select: { position: true }
        });

        const recipe = await tx.recipe.create({
          data: {
            productId: data.productId,
            position: lastRecipe ? lastRecipe.position + 1 : 0,
            unitsPerBatch: data.unitsPerBatch,
            status: ProductStatus.ACTIVE,
            items: {
              createMany: {
                data: data.ingredients.map((item) => ({
                  ingredientId: item.ingredientId,
                  quantityNeeded: item.quantityNeeded
                }))
              }
            }
          },
          select: { id: true }
        });

        await tx.product.update({
          where: { id: data.productId },
          data: { recipeCostPerUnit }
        });

        return recipe.id;
      });

      CustomLogger.info('[Recipes] Recipe committed; recalculating dependent product pricing');
      await PricingEngine.recalculateProducts([data.productId]);

      const recipe = await prismaClient.recipe.findUnique({
        where: { id: recipeId },
        include: RECIPE_RESPONSE_INCLUDE
      });
      if (!recipe) throw new Error('RecipeNotFoundException');

      return presentRecipe(recipe);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        CustomLogger.warn(`[Recipes] Product ${data.productId} already has a recipe`);
        throw new Error('RecipeAlreadyExistsForProductException');
      }
      if (error instanceof Error && (
        error.message === 'ProductNotFoundException' ||
        error.message === 'RecipeAlreadyExistsForProductException' ||
        error.message === 'RecipeIngredientNotFoundException'
      )) {
        CustomLogger.warn(`[Recipes] Create rejected: ${error.message}`);
        throw error;
      }

      CustomLogger.error(`[Recipes] Failed to create recipe for product ${data.productId}`, error);
      throw error;
    }
  }
}
