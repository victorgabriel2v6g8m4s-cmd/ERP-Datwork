import { APP_CONFIG } from '../../../config/app.config.ts';
import type { Recipe } from '../../../types/recipe.ts';
import type { RecipeFormValues, RecipeIngredientOption, RecipeIngredientSelection } from '../types/recipe-form.types.ts';
import { normalizeRecipeUnitsPerBatch } from './recipeCalculations.ts';

export function createRecipeFormValues(recipe?: Recipe | null): RecipeFormValues {
  if (!recipe) {
    return {
      productId: '',
      unitsPerBatch: APP_CONFIG.recipes.defaults.unitsPerBatch,
      items: [],
      currentIngredientId: '',
      currentQuantity: 0
    };
  }

  return {
    productId: recipe.productId,
    unitsPerBatch: normalizeRecipeUnitsPerBatch(recipe.unitsPerBatch),
    items: recipe.items.map((item) => ({
      ingredientId: item.ingredientId,
      quantityNeeded: item.quantityNeeded,
      name: item.ingredient.name,
      unit: item.ingredient.unit,
      price: item.ingredient.price,
      quantityMax: item.ingredient.quantity
    })),
    currentIngredientId: '',
    currentQuantity: 0
  };
}

export function addIngredientSelection(
  items: RecipeIngredientSelection[],
  ingredient: RecipeIngredientOption,
  quantityNeeded: number
): RecipeIngredientSelection[] {
  if (!Number.isFinite(quantityNeeded) || quantityNeeded <= APP_CONFIG.recipes.limits.minIngredientQuantity) {
    return items;
  }

  const existing = items.find((item) => item.ingredientId === ingredient.id);
  if (existing) {
    return items.map((item) => item.ingredientId === ingredient.id
      ? { ...item, quantityNeeded: item.quantityNeeded + quantityNeeded }
      : item
    );
  }

  return [
    ...items,
    {
      ingredientId: ingredient.id,
      quantityNeeded,
      name: ingredient.name,
      unit: ingredient.unit,
      price: ingredient.price,
      quantityMax: ingredient.quantity
    }
  ];
}
