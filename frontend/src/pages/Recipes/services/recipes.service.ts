import { api } from '../../../api/client.ts';
import { parseProductList } from '../../../utils/productContract.ts';
import { CustomLogger } from '../../../utils/CustomLogger.ts';
import type { Recipe } from '../../../types/recipe.ts';
import type { CreateRecipePayload, RecipeFormOptions, RecipeMutationPayload } from '../types/recipe-form.types.ts';
import { parseRecipeIngredientOptions, parseRecipeList } from '../utils/recipeContract.ts';

export interface RecipePosition {
  id: string;
  position: number;
}

function requireRecipeList(value: unknown): Recipe[] {
  const recipes = parseRecipeList(value);
  if (recipes) return recipes;

  CustomLogger.error('[Recipes] Invalid recipe list response contract received from API');
  throw new Error('InvalidRecipeListResponseContract');
}

export const recipesService = {
  async list(): Promise<Recipe[]> {
    const response = await api.get<unknown>('/recipes');
    return requireRecipeList(response.data);
  },

  async listFormOptions(): Promise<RecipeFormOptions> {
    const [productsResponse, ingredientsResponse] = await Promise.all([
      api.get<unknown>('/products'),
      api.get<unknown>('/ingredients')
    ]);

    const products = parseProductList(productsResponse.data);
    const ingredients = parseRecipeIngredientOptions(ingredientsResponse.data);

    if (!products || !ingredients) {
      CustomLogger.error('[Recipes] Invalid form options response contract received from API');
      throw new Error('InvalidRecipeFormOptionsResponseContract');
    }

    return {
      products: products.filter((product) => product.status === 'ACTIVE'),
      ingredients: ingredients.filter((ingredient) => ingredient.status === 'ACTIVE')
    };
  },

  async create(payload: CreateRecipePayload): Promise<void> {
    await api.post('/recipes', payload);
  },

  async update(id: string, payload: RecipeMutationPayload): Promise<void> {
    await api.put(`/recipes/${id}`, payload);
  },

  async updateStatus(id: string, status: Recipe['status']): Promise<void> {
    await api.patch(`/recipes/${id}/status`, { status });
  },

  async reorder(positions: RecipePosition[]): Promise<void> {
    await api.patch('/recipes/reorder', { positions });
  }
};
