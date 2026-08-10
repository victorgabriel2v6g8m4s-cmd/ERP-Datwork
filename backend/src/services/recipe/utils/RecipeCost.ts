import type { Prisma } from '@prisma/client';
import type { RecipeIngredientMutationInput } from '../../../contracts/recipe/RecipeContract.js';

export async function calculateRecipeCostPerUnit(
  tx: Prisma.TransactionClient,
  ingredients: RecipeIngredientMutationInput[],
  unitsPerBatch: number
): Promise<number> {
  const storedIngredients = await tx.ingredient.findMany({
    where: { id: { in: ingredients.map((item) => item.ingredientId) } },
    select: { id: true, price: true, quantity: true }
  });

  if (storedIngredients.length !== ingredients.length) {
    throw new Error('RecipeIngredientNotFoundException');
  }

  const ingredientsById = new Map(storedIngredients.map((ingredient) => [ingredient.id, ingredient]));
  const batchCost = ingredients.reduce((total, item) => {
    const ingredient = ingredientsById.get(item.ingredientId);
    if (!ingredient || !Number.isFinite(ingredient.quantity) || ingredient.quantity <= 0) {
      throw new Error('InvalidRecipeIngredientCostBasisException');
    }
    return total + (ingredient.price / ingredient.quantity) * item.quantityNeeded;
  }, 0);

  return batchCost / unitsPerBatch;
}
