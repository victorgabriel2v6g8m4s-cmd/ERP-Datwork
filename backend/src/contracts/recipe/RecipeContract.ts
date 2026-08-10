export type RecipeStatus = 'ACTIVE' | 'INACTIVE';
export type RecipeAbcCategory = 'A' | 'B' | 'C';

export interface RecipeIngredientMutationInput {
  ingredientId: string;
  quantityNeeded: number;
}

export interface RecipeMutationInput {
  unitsPerBatch: number;
  ingredients: RecipeIngredientMutationInput[];
}

export interface CreateRecipeInput extends RecipeMutationInput {
  productId: string;
}

export interface UpdateRecipeInput extends RecipeMutationInput {
  id: string;
}

export interface RecipePositionInput {
  id: string;
  position: number;
}

export interface RecipeProductResponse {
  sku: string;
  name: string;
  thumbnail: string | null;
  abcCategory: RecipeAbcCategory;
  recipeCostPerUnit: number;
  indirectCost: number;
  totalUnitCost: number;
}

export interface RecipeIngredientResponse {
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

export interface RecipeItemResponse {
  id: string;
  recipeId: string;
  ingredientId: string;
  quantityNeeded: number;
  ingredient: RecipeIngredientResponse;
}

export interface RecipeResponse {
  id: string;
  productId: string;
  status: RecipeStatus;
  position: number;
  unitsPerBatch: number;
  createdAt: string;
  updatedAt: string;
  product: RecipeProductResponse;
  items: RecipeItemResponse[];
}
