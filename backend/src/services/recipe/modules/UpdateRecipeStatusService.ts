import { Prisma, ProductStatus } from '@prisma/client';
import prismaClient from '../../../config/prisma.js';
import type { RecipeResponse, RecipeStatus } from '../../../contracts/recipe/RecipeContract.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { presentRecipe, RECIPE_RESPONSE_INCLUDE } from '../../../presenters/recipe/RecipePresenter.js';

export class UpdateRecipeStatusService {
  async execute(id: string, status: RecipeStatus): Promise<RecipeResponse> {
    CustomLogger.info(`[Recipes] Updating recipe ${id} status to ${status}`);

    try {
      const recipe = await prismaClient.recipe.update({
        where: { id },
        data: { status: status === 'ACTIVE' ? ProductStatus.ACTIVE : ProductStatus.INACTIVE },
        include: RECIPE_RESPONSE_INCLUDE
      });
      return presentRecipe(recipe);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new Error('RecipeNotFoundException');
      }

      CustomLogger.error(`[Recipes] Failed to update recipe ${id} status`, error);
      throw error;
    }
  }
}
