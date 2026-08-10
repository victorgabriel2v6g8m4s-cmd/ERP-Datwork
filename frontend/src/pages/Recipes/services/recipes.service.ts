import { api } from '../../../api/client.ts';
import { APP_CONFIG } from '../../../config/app.config.ts';
import { parseProductList } from '../../../utils/productContract.ts';
import { CustomLogger } from '../../../utils/CustomLogger.ts';
import type { Recipe } from '../../../types/recipe.ts';
import type { CreateRecipePayload, RecipeFormOptions, RecipeMutationPayload } from '../types/recipe-form.types.ts';
import { parseRecipeIngredientOptions, parseRecipeList, parseRecipeResponse } from '../utils/recipeContract.ts';

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

function requireRecipe(value: unknown, operation: string): Recipe {
  const recipe = parseRecipeResponse(value);
  if (recipe) return recipe;

  CustomLogger.error(`[Recipes] Invalid recipe response contract during ${operation}`);
  throw new Error('InvalidRecipeResponseContract');
}

export const recipesService = {
  async list(): Promise<Recipe[]> {
    const response = await api.get<unknown>(APP_CONFIG.api.endpoints.recipes.catalog);
    return requireRecipeList(response.data);
  },

  async listFormOptions(): Promise<RecipeFormOptions> {
    const [productsResponse, ingredientsResponse] = await Promise.all([
      api.get<unknown>(APP_CONFIG.api.endpoints.products.catalog),
      api.get<unknown>(APP_CONFIG.api.endpoints.ingredients.catalog)
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

  async create(payload: CreateRecipePayload): Promise<Recipe> {
    const response = await api.post<unknown>(APP_CONFIG.api.endpoints.recipes.catalog, payload);
    return requireRecipe(response.data, 'create');
  },

  async update(id: string, payload: RecipeMutationPayload): Promise<Recipe> {
    const response = await api.put<unknown>(APP_CONFIG.api.endpoints.recipes.item(id), payload);
    return requireRecipe(response.data, 'update');
  },

  async updateStatus(id: string, status: Recipe['status']): Promise<Recipe> {
    const response = await api.patch<unknown>(APP_CONFIG.api.endpoints.recipes.status(id), { status });
    return requireRecipe(response.data, 'update status');
  },

  async reorder(positions: RecipePosition[]): Promise<Recipe[]> {
    const response = await api.patch<unknown>(APP_CONFIG.api.endpoints.recipes.reorder, { positions });
    return requireRecipeList(response.data);
  }
};
