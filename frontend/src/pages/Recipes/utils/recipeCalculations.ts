import { APP_CONFIG } from '../../../config/app.config.ts';
import type { Recipe, RecipeItem } from '../../../types/recipe.ts';
import type { RecipeFormValues, RecipeIngredientSelection, RecipeMutationPayload } from '../types/recipe-form.types.ts';

export function normalizeRecipeUnitsPerBatch(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  const minimum = APP_CONFIG.recipes.limits.minUnitsPerBatch;

  return Number.isInteger(parsed) && parsed >= minimum
    ? parsed
    : APP_CONFIG.recipes.defaults.unitsPerBatch;
}

export function calculateRecipeIngredientCost(
  item: Pick<RecipeIngredientSelection, 'price' | 'quantityMax' | 'quantityNeeded'>
): number {
  if (!Number.isFinite(item.price) || !Number.isFinite(item.quantityMax) || !Number.isFinite(item.quantityNeeded)) {
    return 0;
  }

  if (item.quantityMax <= 0 || item.quantityNeeded <= 0) return 0;
  return (item.price / item.quantityMax) * item.quantityNeeded;
}

export function calculateRecipeCosts(
  items: RecipeIngredientSelection[],
  unitsPerBatch: number
): { batchCost: number; unitCost: number } {
  const batchCost = items.reduce((sum, item) => sum + calculateRecipeIngredientCost(item), 0);
  const safeUnits = normalizeRecipeUnitsPerBatch(unitsPerBatch);

  return {
    batchCost,
    unitCost: batchCost / safeUnits
  };
}

export function calculatePersistedRecipeCosts(recipe: Pick<Recipe, 'items' | 'unitsPerBatch'>) {
  const batchCost = recipe.items.reduce((sum, item) => sum + calculateRecipeItemCost(item), 0);
  const safeUnits = normalizeRecipeUnitsPerBatch(recipe.unitsPerBatch);

  return {
    batchCost,
    unitCost: batchCost / safeUnits
  };
}

export function calculateRecipeItemCost(item: RecipeItem): number {
  const baseVolume = item.ingredient.quantity;
  if (!Number.isFinite(baseVolume) || baseVolume <= 0) return 0;

  return (item.ingredient.price / baseVolume) * item.quantityNeeded;
}

export function buildRecipeMutationPayload(values: RecipeFormValues): RecipeMutationPayload | null {
  if (values.items.length === 0) return null;

  const unitsPerBatch = normalizeRecipeUnitsPerBatch(values.unitsPerBatch);
  const ingredients = values.items
    .filter((item) => item.ingredientId && Number.isFinite(item.quantityNeeded) && item.quantityNeeded > 0)
    .map((item) => ({ ingredientId: item.ingredientId, quantityNeeded: item.quantityNeeded }));

  if (ingredients.length !== values.items.length) return null;

  return { unitsPerBatch, ingredients };
}
