import type { Recipe, RecipeIngredientSummary, RecipeItem, RecipeProductSummary } from '../../../types/recipe.ts';
import type { RecipeIngredientOption } from '../types/recipe-form.types.ts';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function readFiniteNumber(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseProductSummary(value: unknown): RecipeProductSummary | null {
  if (!isRecord(value)) return null;

  const sku = readString(value.sku);
  const name = readString(value.name);
  const abcCategory = value.abcCategory;
  const recipeCostPerUnit = readFiniteNumber(value.recipeCostPerUnit);
  const indirectCost = readFiniteNumber(value.indirectCost);
  const totalUnitCost = readFiniteNumber(value.totalUnitCost);

  if (
    !sku ||
    !name ||
    (abcCategory !== 'A' && abcCategory !== 'B' && abcCategory !== 'C') ||
    recipeCostPerUnit === null ||
    indirectCost === null ||
    totalUnitCost === null
  ) {
    return null;
  }

  const thumbnail = value.thumbnail === null || value.thumbnail === undefined
    ? null
    : readString(value.thumbnail);

  if (value.thumbnail !== null && value.thumbnail !== undefined && !thumbnail) return null;

  return {
    sku,
    name,
    thumbnail,
    abcCategory,
    recipeCostPerUnit,
    indirectCost,
    totalUnitCost
  };
}

function parseIngredientSummary(value: unknown): RecipeIngredientSummary | null {
  if (!isRecord(value)) return null;

  const name = readString(value.name);
  const price = readFiniteNumber(value.price);
  const quantity = readFiniteNumber(value.quantity);
  const unit = readString(value.unit);

  if (!name || price === null || quantity === null || quantity <= 0 || !unit) return null;

  return { name, price, quantity, unit };
}

function parseRecipeItem(value: unknown): RecipeItem | null {
  if (!isRecord(value)) return null;

  const id = readString(value.id);
  const recipeId = readString(value.recipeId);
  const ingredientId = readString(value.ingredientId);
  const quantityNeeded = readFiniteNumber(value.quantityNeeded);
  const ingredient = parseIngredientSummary(value.ingredient);

  if (!id || !recipeId || !ingredientId || quantityNeeded === null || quantityNeeded <= 0 || !ingredient) {
    return null;
  }

  return { id, recipeId, ingredientId, quantityNeeded, ingredient };
}

export function parseRecipeResponse(value: unknown): Recipe | null {
  if (!isRecord(value)) return null;

  const id = readString(value.id);
  const productId = readString(value.productId);
  const status = value.status;
  const position = readFiniteNumber(value.position);
  const unitsPerBatch = readFiniteNumber(value.unitsPerBatch);
  const createdAt = readString(value.createdAt);
  const updatedAt = readString(value.updatedAt);
  const product = parseProductSummary(value.product);

  if (
    !id ||
    !productId ||
    (status !== 'ACTIVE' && status !== 'INACTIVE') ||
    position === null ||
    !Number.isInteger(position) ||
    position < 0 ||
    unitsPerBatch === null ||
    !Number.isInteger(unitsPerBatch) ||
    unitsPerBatch < 1 ||
    !createdAt ||
    !updatedAt ||
    !product ||
    !Array.isArray(value.items)
  ) {
    return null;
  }

  const items = value.items.map(parseRecipeItem);
  if (items.some((item) => item === null)) return null;

  return {
    id,
    productId,
    status,
    position,
    unitsPerBatch,
    createdAt,
    updatedAt,
    product,
    items: items as RecipeItem[]
  };
}

export function parseRecipeList(value: unknown): Recipe[] | null {
  if (!Array.isArray(value)) return null;

  const recipes = value.map(parseRecipeResponse);
  return recipes.some((recipe) => recipe === null) ? null : recipes as Recipe[];
}

export function parseRecipeIngredientOptions(value: unknown): RecipeIngredientOption[] | null {
  if (!Array.isArray(value)) return null;

  const options: RecipeIngredientOption[] = [];

  for (const entry of value) {
    if (!isRecord(entry)) return null;

    const id = readString(entry.id);
    const name = readString(entry.name);
    const price = readFiniteNumber(entry.price);
    const quantity = readFiniteNumber(entry.quantity);
    const unit = readString(entry.unit);
    const status = entry.status;

    if (
      !id ||
      !name ||
      price === null ||
      quantity === null ||
      quantity <= 0 ||
      !unit ||
      (status !== 'ACTIVE' && status !== 'INACTIVE')
    ) {
      return null;
    }

    options.push({ id, name, price, quantity, unit, status });
  }

  return options;
}
