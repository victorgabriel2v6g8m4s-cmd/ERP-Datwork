import prismaClient from '../../../config/prisma.js';
import type { RecipeResponse } from '../../../contracts/recipe/RecipeContract.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { presentRecipeList, RECIPE_RESPONSE_INCLUDE } from '../../../presenters/recipe/RecipePresenter.js';

export class ListRecipesService {
  async execute(): Promise<RecipeResponse[]> {
    CustomLogger.info('[Recipes] Loading complete recipe catalog including inactive records');

    const recipes = await prismaClient.recipe.findMany({
      orderBy: { position: 'asc' },
      include: RECIPE_RESPONSE_INCLUDE
    });
    return presentRecipeList(recipes);
  }
}
