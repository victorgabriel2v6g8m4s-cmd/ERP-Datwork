import type { Product } from '../../../types/product.ts';
import type { Recipe } from '../../../types/recipe.ts';

export interface RecipeIngredientOption {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface RecipeIngredientSelection {
  ingredientId: string;
  quantityNeeded: number;
  name: string;
  unit: string;
  price: number;
  quantityMax: number;
}

export interface RecipeFormValues {
  productId: string;
  unitsPerBatch: number;
  items: RecipeIngredientSelection[];
  currentIngredientId: string;
  currentQuantity: number;
}

export interface RecipeMutationIngredient {
  ingredientId: string;
  quantityNeeded: number;
}

export interface RecipeMutationPayload {
  unitsPerBatch: number;
  ingredients: RecipeMutationIngredient[];
}

export interface CreateRecipePayload extends RecipeMutationPayload {
  productId: string;
}

export interface RecipeFormOptions {
  products: Product[];
  ingredients: RecipeIngredientOption[];
}

export type RecipeFormMode = 'create' | 'edit';

export interface RecipeFormContext {
  mode: RecipeFormMode;
  recipe?: Recipe | null;
}
