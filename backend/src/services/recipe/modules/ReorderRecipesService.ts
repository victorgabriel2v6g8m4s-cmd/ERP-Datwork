import prismaClient from '../../../config/prisma.js';
import type { RecipePositionInput, RecipeResponse } from '../../../contracts/recipe/RecipeContract.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { presentRecipeList, RECIPE_RESPONSE_INCLUDE } from '../../../presenters/recipe/RecipePresenter.js';

export class ReorderRecipesService {
  async execute(positions: RecipePositionInput[]): Promise<RecipeResponse[]> {
    const current = await prismaClient.recipe.findMany({ select: { id: true, position: true } });
    const currentIds = new Set(current.map((recipe) => recipe.id));
    const incomingIds = new Set(positions.map((recipe) => recipe.id));

    if (
      positions.length !== current.length ||
      incomingIds.size !== currentIds.size ||
      [...currentIds].some((id) => !incomingIds.has(id))
    ) {
      throw new Error('RecipeReorderMismatch');
    }

    const currentPositions = new Map(current.map((recipe) => [recipe.id, recipe.position]));
    const changedPositions = positions.filter((recipe) => currentPositions.get(recipe.id) !== recipe.position);
    CustomLogger.info(`[Recipes] Persisting ${changedPositions.length} changed positions from ${positions.length} recipes`);

    return prismaClient.$transaction(async (tx) => {
      for (const recipe of changedPositions) {
        await tx.recipe.update({
          where: { id: recipe.id },
          data: { position: recipe.position }
        });
      }

      const reordered = await tx.recipe.findMany({
        orderBy: { position: 'asc' },
        include: RECIPE_RESPONSE_INCLUDE
      });
      return presentRecipeList(reordered);
    });
  }
}
