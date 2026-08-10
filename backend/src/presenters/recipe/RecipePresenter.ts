import { Prisma } from '@prisma/client';
import type { RecipeResponse } from '../../contracts/recipe/RecipeContract.js';

export const RECIPE_RESPONSE_INCLUDE = {
  product: {
    select: {
      sku: true,
      name: true,
      thumbnail: true,
      abcCategory: true,
      recipeCostPerUnit: true,
      indirectCost: true,
      totalUnitCost: true
    }
  },
  items: {
    include: {
      ingredient: {
        select: {
          name: true,
          price: true,
          quantity: true,
          unit: true
        }
      }
    }
  }
} satisfies Prisma.RecipeInclude;

export type PresentableRecipe = Prisma.RecipeGetPayload<{
  include: typeof RECIPE_RESPONSE_INCLUDE;
}>;

export function presentRecipe(recipe: PresentableRecipe): RecipeResponse {
  return {
    id: recipe.id,
    productId: recipe.productId,
    status: recipe.status,
    position: recipe.position,
    unitsPerBatch: recipe.unitsPerBatch,
    createdAt: recipe.createdAt.toISOString(),
    updatedAt: recipe.updatedAt.toISOString(),
    product: {
      sku: recipe.product.sku,
      name: recipe.product.name,
      thumbnail: recipe.product.thumbnail,
      abcCategory: recipe.product.abcCategory,
      recipeCostPerUnit: recipe.product.recipeCostPerUnit,
      indirectCost: recipe.product.indirectCost,
      totalUnitCost: recipe.product.totalUnitCost
    },
    items: recipe.items.map((item) => ({
      id: item.id,
      recipeId: item.recipeId,
      ingredientId: item.ingredientId,
      quantityNeeded: item.quantityNeeded,
      ingredient: {
        name: item.ingredient.name,
        price: item.ingredient.price,
        quantity: item.ingredient.quantity,
        unit: item.ingredient.unit
      }
    }))
  };
}

export function presentRecipeList(recipes: PresentableRecipe[]): RecipeResponse[] {
  return recipes.map(presentRecipe);
}
